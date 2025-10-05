import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { CurlRunner } from '../../index.js';

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

describe('CurlRunner', () => {
  let curlRunner;
  const testScriptsDir = './test-scripts';
  const testLogsDir = './test-logs';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['test-script.sh', 'another-script.sh']);
    fs.mkdirSync.mockImplementation(() => {});
    fs.appendFileSync.mockImplementation(() => {});
    
    curlRunner = new CurlRunner(testScriptsDir, testLogsDir);
  });

  describe('Constructor', () => {
    test('should initialize with default directories', () => {
      const defaultRunner = new CurlRunner();
      expect(defaultRunner.scriptsDir).toBe('./scripts');
      expect(defaultRunner.logsDir).toBe('./var/logs');
      expect(defaultRunner.reportLogFile).toBe('curl-runner-report.log');
      expect(defaultRunner.errorLogFile).toBe('curl-api-errors.log');
    });

    test('should initialize with custom directories', () => {
      expect(curlRunner.scriptsDir).toBe(testScriptsDir);
      expect(curlRunner.logsDir).toBe(testLogsDir);
    });

    test('should create logs directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      new CurlRunner(testScriptsDir, testLogsDir);
      expect(fs.mkdirSync).toHaveBeenCalledWith(testLogsDir, { recursive: true });
    });
  });

  describe('generateLogFilename', () => {
    test('should generate filename with timestamp for batch runs', () => {
      const filename = curlRunner.generateLogFilename();
      expect(filename).toMatch(/^run_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    test('should generate filename with script name and timestamp', () => {
      const filename = curlRunner.generateLogFilename('test-script.sh');
      expect(filename).toMatch(/^test-script_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    test('should clean script name for filename', () => {
      const filename = curlRunner.generateLogFilename('test-script@#$%.sh');
      expect(filename).toMatch(/^test-script____\.log$/);
    });
  });

  describe('writeLog', () => {
    test('should write log entry to file', () => {
      const logFile = 'test.log';
      const entry = 'Test log entry';
      
      curlRunner.writeLog(logFile, entry);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        path.join(testLogsDir, logFile),
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Test log entry\n$/)
      );
    });

    test('should handle write errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });
      
      curlRunner.writeLog('test.log', 'Test entry');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error writing to log file: Write failed');
      consoleSpy.mockRestore();
    });
  });

  describe('writeReportLog', () => {
    test('should write report log entry', () => {
      const entry = 'Test report entry';
      
      curlRunner.writeReportLog(entry);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        path.join(testLogsDir, 'curl-runner-report.log'),
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Test report entry\n$/)
      );
    });
  });

  describe('writeErrorLog', () => {
    test('should write error log entry with basic info', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'Test error';
      
      curlRunner.writeErrorLog(scriptName, errorDetails);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        path.join(testLogsDir, 'curl-api-errors.log'),
        expect.stringContaining('❌ API ERROR: test-script.sh')
      );
    });

    test('should write error log entry with HTTP status and duration', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'HTTP 404 error';
      const httpStatus = 404;
      const duration = 1500;
      
      curlRunner.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        path.join(testLogsDir, 'curl-api-errors.log'),
        expect.stringContaining('❌ API ERROR: test-script.sh (HTTP 404) (1500ms)')
      );
    });
  });

  describe('parseCurlOutput', () => {
    test('should parse HTTP status from output', () => {
      const stdout = 'Some output\nHTTP Status: 200\nMore output';
      const stderr = '';
      
      const result = curlRunner.parseCurlOutput(stdout, stderr);
      
      expect(result.httpStatus).toBe(200);
      expect(result.isApiError).toBe(false);
      expect(result.errorMessage).toBeNull();
    });

    test('should detect API errors for 4xx status codes', () => {
      const stdout = 'Some output\nHTTP Status: 404\nMore output';
      const stderr = '';
      
      const result = curlRunner.parseCurlOutput(stdout, stderr);
      
      expect(result.httpStatus).toBe(404);
      expect(result.isApiError).toBe(true);
      expect(result.errorMessage).toBe('HTTP 404 error');
    });

    test('should detect API errors for 5xx status codes', () => {
      const stdout = 'Some output\nHTTP Status: 500\nMore output';
      const stderr = '';
      
      const result = curlRunner.parseCurlOutput(stdout, stderr);
      
      expect(result.httpStatus).toBe(500);
      expect(result.isApiError).toBe(true);
      expect(result.errorMessage).toBe('HTTP 500 error');
    });

    test('should use stderr as error message when available', () => {
      const stdout = 'Some output\nHTTP Status: 404\nMore output';
      const stderr = 'Connection timeout';
      
      const result = curlRunner.parseCurlOutput(stdout, stderr);
      
      expect(result.httpStatus).toBe(404);
      expect(result.isApiError).toBe(true);
      expect(result.errorMessage).toBe('Connection timeout');
    });
  });

  describe('scanScripts', () => {
    test('should return list of .sh files', () => {
      const scripts = curlRunner.scanScripts();
      
      expect(scripts).toEqual(['test-script.sh', 'another-script.sh']);
      expect(fs.readdirSync).toHaveBeenCalledWith(testScriptsDir);
    });

    test('should create scripts directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      
      const scripts = curlRunner.scanScripts();
      
      expect(fs.mkdirSync).toHaveBeenCalledWith(testScriptsDir, { recursive: true });
      expect(scripts).toEqual([]);
    });

    test('should handle readdir errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Read failed');
      });
      
      const scripts = curlRunner.scanScripts();
      
      expect(scripts).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error scanning directory: Read failed');
      consoleSpy.mockRestore();
    });

    test('should filter only .sh files', () => {
      fs.readdirSync.mockReturnValue(['script1.sh', 'script2.txt', 'script3.sh', 'README.md']);
      
      const scripts = curlRunner.scanScripts();
      
      expect(scripts).toEqual(['script1.sh', 'script3.sh']);
    });
  });

  describe('runScript', () => {
    test('should return false if script does not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      
      const result = await curlRunner.runScript('nonexistent.sh');
      
      expect(result).toBe(false);
    });

    test('should execute script successfully', async () => {
      const mockStdout = 'Test output\nHTTP Status: 200\n';
      exec.mockImplementation((command, callback) => {
        callback(null, mockStdout, '');
      });
      
      const result = await curlRunner.runScript('test-script.sh');
      
      expect(result).toBe(true);
      expect(exec).toHaveBeenCalledWith('bash "scripts/test-script.sh"', expect.any(Function));
    });

    test('should handle script execution errors', async () => {
      const mockError = new Error('Script failed');
      exec.mockImplementation((command, callback) => {
        callback(mockError, '', 'Error output');
      });
      
      const result = await curlRunner.runScript('error-script.sh');
      
      expect(result).toBe(false);
    });

    test('should handle API errors (HTTP 4xx/5xx)', async () => {
      const mockStdout = 'Some output\nHTTP Status: 404\nMore output';
      exec.mockImplementation((command, callback) => {
        callback(null, mockStdout, '');
      });
      
      const result = await curlRunner.runScript('test-script.sh');
      
      expect(result).toBe(false);
    });
  });

  describe('listScripts', () => {
    test('should return list of available scripts', () => {
      const scripts = curlRunner.listScripts();
      
      expect(scripts).toEqual(['test-script.sh', 'another-script.sh']);
    });
  });
});