import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { exec } from 'child_process';

// Mock child_process
const mockExec = mock.fn();

// Mock the utility classes
const mockLogger = {
  ensureLogsDirectory: mock.fn(),
  generateLogFilename: mock.fn(),
  writeLog: mock.fn(),
  writeReportLog: mock.fn(),
  writeErrorLog: mock.fn(),
  reportLogFile: 'curl-runner-report.log',
  errorLogFile: 'curl-api-errors.log'
};

const mockFileSystem = {
  scanScripts: mock.fn(),
  fileExists: mock.fn(),
  ensureDirectory: mock.fn(),
  joinPath: mock.fn()
};

const mockCurlParser = {
  parseCurlOutput: mock.fn()
};

// Mock the modules before importing CurlRunner
const originalImport = global.import;
global.import = async (specifier) => {
  if (specifier.includes('logger.js')) {
    return { Logger: class { constructor() { return mockLogger; } } };
  }
  if (specifier.includes('fileSystem.js')) {
    return { FileSystem: mockFileSystem };
  }
  if (specifier.includes('parser.js')) {
    return { CurlParser: mockCurlParser };
  }
  if (specifier.includes('defaults.js')) {
    return { 
      DEFAULT_CONFIG: {
        SCRIPTS_DIR: './scripts',
        LOGS_DIR: './var/logs',
        REPORT_LOG_FILE: 'curl-runner-report.log',
        ERROR_LOG_FILE: 'curl-api-errors.log',
        SCRIPT_EXTENSION: '.sh',
        SCRIPT_DELAY_MS: 100
      }
    };
  }
  return originalImport(specifier);
};

// Import CurlRunner after setting up mocks
const { CurlRunner } = await import('../../../src/lib/CurlRunner.js');

// Restore original import
global.import = originalImport;

describe('CurlRunner', () => {
  let curlRunner;
  const testScriptsDir = './test-scripts';
  const testLogsDir = './test-logs';

  beforeEach(() => {
    // Reset all mocks
    mockExec.mock.resetCalls();
    mockLogger.ensureLogsDirectory.mock.resetCalls();
    mockLogger.generateLogFilename.mock.resetCalls();
    mockLogger.writeLog.mock.resetCalls();
    mockLogger.writeReportLog.mock.resetCalls();
    mockLogger.writeErrorLog.mock.resetCalls();
    mockFileSystem.scanScripts.mock.resetCalls();
    mockFileSystem.fileExists.mock.resetCalls();
    mockFileSystem.ensureDirectory.mock.resetCalls();
    mockFileSystem.joinPath.mock.resetCalls();
    mockCurlParser.parseCurlOutput.mock.resetCalls();
    
    // Setup default mock implementations
    mockLogger.generateLogFilename.mock.mockImplementation((scriptName) => {
      if (scriptName) {
        return `${scriptName.replace('.sh', '')}_2025-10-05T10-00-00.log`;
      }
      return 'run_2025-10-05T10-00-00.log';
    });
    
    mockFileSystem.scanScripts.mock.mockImplementation(() => ['test-script.sh', 'another-script.sh']);
    mockFileSystem.fileExists.mock.mockImplementation(() => true);
    mockFileSystem.joinPath.mock.mockImplementation((...paths) => paths.join('/'));
    
    mockCurlParser.parseCurlOutput.mock.mockImplementation(() => ({
      httpStatus: 200,
      isApiError: false,
      errorMessage: null
    }));
    
    curlRunner = new CurlRunner(testScriptsDir, testLogsDir);
  });

  describe('Constructor', () => {
    it('should initialize with default directories', () => {
      const defaultRunner = new CurlRunner();
      assert.strictEqual(defaultRunner.scriptsDir, './scripts');
      assert.strictEqual(defaultRunner.logsDir, './var/logs');
      assert.ok(defaultRunner.logger);
      assert.strictEqual(defaultRunner.logger.reportLogFile, 'curl-runner-report.log');
      assert.strictEqual(defaultRunner.logger.errorLogFile, 'curl-api-errors.log');
    });

    it('should initialize with custom directories', () => {
      assert.strictEqual(curlRunner.scriptsDir, testScriptsDir);
      assert.strictEqual(curlRunner.logsDir, testLogsDir);
    });

    it('should create logs directory if it does not exist', () => {
      assert.strictEqual(mockLogger.ensureLogsDirectory.mock.callCount(), 1);
    });
  });

  describe('generateLogFilename', () => {
    it('should generate filename with timestamp for batch runs', () => {
      const filename = curlRunner.generateLogFilename();
      assert.strictEqual(filename, 'run_2025-10-05T10-00-00.log');
      assert.strictEqual(mockLogger.generateLogFilename.mock.callCount(), 1);
    });

    it('should generate filename with script name and timestamp', () => {
      const filename = curlRunner.generateLogFilename('test-script.sh');
      assert.strictEqual(filename, 'test-script_2025-10-05T10-00-00.log');
      assert.strictEqual(mockLogger.generateLogFilename.mock.callCount(), 1);
    });
  });

  describe('writeLog', () => {
    it('should write log entry to file', () => {
      const logFile = 'test.log';
      const entry = 'Test log entry';
      
      curlRunner.writeLog(logFile, entry);
      
      assert.strictEqual(mockLogger.writeLog.mock.callCount(), 1);
      const call = mockLogger.writeLog.mock.calls[0];
      assert.strictEqual(call[0], logFile);
      assert.strictEqual(call[1], entry);
    });
  });

  describe('writeReportLog', () => {
    it('should write report log entry', () => {
      const entry = 'Test report entry';
      
      curlRunner.writeReportLog(entry);
      
      assert.strictEqual(mockLogger.writeReportLog.mock.callCount(), 1);
      const call = mockLogger.writeReportLog.mock.calls[0];
      assert.strictEqual(call[0], entry);
    });
  });

  describe('writeErrorLog', () => {
    it('should write error log entry with basic info', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'Test error';
      
      curlRunner.writeErrorLog(scriptName, errorDetails);
      
      assert.strictEqual(mockLogger.writeErrorLog.mock.callCount(), 1);
      const call = mockLogger.writeErrorLog.mock.calls[0];
      assert.strictEqual(call[0], scriptName);
      assert.strictEqual(call[1], errorDetails);
    });

    it('should write error log entry with HTTP status and duration', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'HTTP 404 error';
      const httpStatus = 404;
      const duration = 1500;
      
      curlRunner.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
      
      assert.strictEqual(mockLogger.writeErrorLog.mock.callCount(), 1);
      const call = mockLogger.writeErrorLog.mock.calls[0];
      assert.strictEqual(call[0], scriptName);
      assert.strictEqual(call[1], errorDetails);
      assert.strictEqual(call[2], httpStatus);
      assert.strictEqual(call[3], duration);
    });
  });

  describe('parseCurlOutput', () => {
    it('should parse HTTP status from output', () => {
      const stdout = 'Some output\nHTTP Status: 200\nMore output';
      const stderr = '';
      
      const result = curlRunner.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(mockCurlParser.parseCurlOutput.mock.callCount(), 1);
      const call = mockCurlParser.parseCurlOutput.mock.calls[0];
      assert.strictEqual(call[0], stdout);
      assert.strictEqual(call[1], stderr);
    });
  });

  describe('scanScripts', () => {
    it('should return list of .sh files', () => {
      const scripts = curlRunner.scanScripts();
      
      assert.deepStrictEqual(scripts, ['test-script.sh', 'another-script.sh']);
      assert.strictEqual(mockFileSystem.scanScripts.mock.callCount(), 1);
      const call = mockFileSystem.scanScripts.mock.calls[0];
      assert.strictEqual(call[0], testScriptsDir);
    });
  });

  describe('runScript', () => {
    it('should return false if script does not exist', async () => {
      mockFileSystem.fileExists.mock.mockImplementation(() => false);
      
      const result = await curlRunner.runScript('nonexistent.sh');
      
      assert.strictEqual(result, false);
    });

    it('should execute script successfully', async () => {
      const mockStdout = 'Test output\nHTTP Status: 200\n';
      mockExec.mock.mockImplementation((command, callback) => {
        callback(null, mockStdout, '');
      });
      
      const result = await curlRunner.runScript('test-script.sh');
      
      assert.strictEqual(result, true);
      assert.strictEqual(mockExec.mock.callCount(), 1);
    });

    it('should handle script execution errors', async () => {
      const mockError = new Error('Script failed');
      mockExec.mock.mockImplementation((command, callback) => {
        callback(mockError, '', 'Error output');
      });
      
      const result = await curlRunner.runScript('error-script.sh');
      
      assert.strictEqual(result, false);
    });

    it('should handle API errors (HTTP 4xx/5xx)', async () => {
      mockCurlParser.parseCurlOutput.mock.mockImplementation(() => ({
        httpStatus: 404,
        isApiError: true,
        errorMessage: 'HTTP 404 error'
      }));
      
      const mockStdout = 'Some output\nHTTP Status: 404\nMore output';
      mockExec.mock.mockImplementation((command, callback) => {
        callback(null, mockStdout, '');
      });
      
      const result = await curlRunner.runScript('test-script.sh');
      
      assert.strictEqual(result, false);
    });
  });

  describe('listScripts', () => {
    it('should return list of available scripts', () => {
      const scripts = curlRunner.listScripts();
      
      assert.deepStrictEqual(scripts, ['test-script.sh', 'another-script.sh']);
    });
  });
});