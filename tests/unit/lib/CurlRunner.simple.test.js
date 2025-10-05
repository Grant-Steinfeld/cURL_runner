import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';

// Mock the utility classes at the module level
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

// Mock the modules
const mockModules = {
  '../utils/logger.js': { Logger: class { constructor() { return mockLogger; } } },
  '../utils/fileSystem.js': { FileSystem: mockFileSystem },
  '../utils/parser.js': { CurlParser: mockCurlParser },
  '../config/defaults.js': { 
    DEFAULT_CONFIG: {
      SCRIPTS_DIR: './scripts',
      LOGS_DIR: './var/logs',
      REPORT_LOG_FILE: 'curl-runner-report.log',
      ERROR_LOG_FILE: 'curl-api-errors.log',
      SCRIPT_EXTENSION: '.sh',
      SCRIPT_DELAY_MS: 100
    }
  }
};

// Mock the import system
const originalImport = global.import;
global.import = async (specifier) => {
  if (mockModules[specifier]) {
    return mockModules[specifier];
  }
  return originalImport(specifier);
};

// Import CurlRunner after setting up mocks
const { CurlRunner } = await import('../../../src/lib/CurlRunner.js');

// Restore original import
global.import = originalImport;

describe('CurlRunner - Simple Mocking', () => {
  let curlRunner;
  const testScriptsDir = './test-scripts';
  const testLogsDir = './test-logs';

  beforeEach(() => {
    // Reset all mocks
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
    });

    it('should initialize with custom directories', () => {
      assert.strictEqual(curlRunner.scriptsDir, testScriptsDir);
      assert.strictEqual(curlRunner.logsDir, testLogsDir);
    });

    it('should call ensureLogsDirectory on logger', () => {
      assert.strictEqual(mockLogger.ensureLogsDirectory.mock.callCount(), 1);
    });
  });

  describe('generateLogFilename', () => {
    it('should delegate to logger', () => {
      const filename = curlRunner.generateLogFilename('test-script.sh');
      assert.strictEqual(mockLogger.generateLogFilename.mock.callCount(), 1);
      const call = mockLogger.generateLogFilename.mock.calls[0];
      assert.strictEqual(call[0], 'test-script.sh');
    });
  });

  describe('writeLog', () => {
    it('should delegate to logger', () => {
      curlRunner.writeLog('test.log', 'Test entry');
      assert.strictEqual(mockLogger.writeLog.mock.callCount(), 1);
      const call = mockLogger.writeLog.mock.calls[0];
      assert.strictEqual(call[0], 'test.log');
      assert.strictEqual(call[1], 'Test entry');
    });
  });

  describe('writeReportLog', () => {
    it('should delegate to logger', () => {
      curlRunner.writeReportLog('Test report');
      assert.strictEqual(mockLogger.writeReportLog.mock.callCount(), 1);
      const call = mockLogger.writeReportLog.mock.calls[0];
      assert.strictEqual(call[0], 'Test report');
    });
  });

  describe('writeErrorLog', () => {
    it('should delegate to logger with all parameters', () => {
      curlRunner.writeErrorLog('test.sh', 'Error', 404, 1000);
      assert.strictEqual(mockLogger.writeErrorLog.mock.callCount(), 1);
      const call = mockLogger.writeErrorLog.mock.calls[0];
      assert.strictEqual(call[0], 'test.sh');
      assert.strictEqual(call[1], 'Error');
      assert.strictEqual(call[2], 404);
      assert.strictEqual(call[3], 1000);
    });
  });

  describe('parseCurlOutput', () => {
    it('should delegate to CurlParser', () => {
      curlRunner.parseCurlOutput('stdout', 'stderr');
      assert.strictEqual(mockCurlParser.parseCurlOutput.mock.callCount(), 1);
      const call = mockCurlParser.parseCurlOutput.mock.calls[0];
      assert.strictEqual(call[0], 'stdout');
      assert.strictEqual(call[1], 'stderr');
    });
  });

  describe('scanScripts', () => {
    it('should delegate to FileSystem', () => {
      const scripts = curlRunner.scanScripts();
      assert.strictEqual(mockFileSystem.scanScripts.mock.callCount(), 1);
      const call = mockFileSystem.scanScripts.mock.calls[0];
      assert.strictEqual(call[0], testScriptsDir);
      assert.deepStrictEqual(scripts, ['test-script.sh', 'another-script.sh']);
    });
  });

  describe('runScript', () => {
    it('should return false if script does not exist', async () => {
      mockFileSystem.fileExists.mock.mockImplementation(() => false);
      
      const result = await curlRunner.runScript('nonexistent.sh');
      
      assert.strictEqual(result, false);
    });

    it('should use FileSystem.joinPath for script path', async () => {
      mockFileSystem.fileExists.mock.mockImplementation(() => true);
      
      // Mock exec to resolve immediately
      const { exec } = await import('child_process');
      const originalExec = exec;
      exec.mockImplementation((command, callback) => {
        callback(null, 'success', '');
      });
      
      await curlRunner.runScript('test.sh');
      
      assert.strictEqual(mockFileSystem.joinPath.mock.callCount(), 1);
      const call = mockFileSystem.joinPath.mock.calls[0];
      assert.strictEqual(call[0], testScriptsDir);
      assert.strictEqual(call[1], 'test.sh');
      
      // Restore original exec
      Object.defineProperty(process, 'child_process', {
        value: { exec: originalExec },
        writable: true
      });
    });
  });
});