import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { CurlRunner } from '../../../src/lib/CurlRunner.js';

// Mock child_process
const mockExec = mock.fn();

// Mock fs
const mockFs = {
  existsSync: mock.fn(),
  readdirSync: mock.fn(),
  mkdirSync: mock.fn(),
  appendFileSync: mock.fn()
};

// Replace the real modules with mocks
Object.defineProperty(process, 'child_process', {
  value: { exec: mockExec },
  writable: true
});

Object.defineProperty(process, 'fs', {
  value: mockFs,
  writable: true
});

describe('CurlRunner', () => {
  let curlRunner;
  const testScriptsDir = './test-scripts';
  const testLogsDir = './test-logs';

  beforeEach(() => {
    // Reset all mocks
    mockExec.mock.resetCalls();
    mockFs.existsSync.mock.resetCalls();
    mockFs.readdirSync.mock.resetCalls();
    mockFs.mkdirSync.mock.resetCalls();
    mockFs.appendFileSync.mock.resetCalls();
    
    // Setup default mock implementations
    mockFs.existsSync.mock.mockImplementation(() => true);
    mockFs.readdirSync.mock.mockImplementation(() => ['test-script.sh', 'another-script.sh']);
    mockFs.mkdirSync.mock.mockImplementation(() => {});
    mockFs.appendFileSync.mock.mockImplementation(() => {});
    
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
      mockFs.existsSync.mock.mockImplementation(() => false);
      new CurlRunner(testScriptsDir, testLogsDir);
      assert.strictEqual(mockFs.mkdirSync.mock.callCount(), 1);
    });
  });

  describe('generateLogFilename', () => {
    it('should generate filename with timestamp for batch runs', () => {
      const filename = curlRunner.generateLogFilename();
      assert.match(filename, /^run_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    it('should generate filename with script name and timestamp', () => {
      const filename = curlRunner.generateLogFilename('test-script.sh');
      assert.match(filename, /^test-script_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    it('should clean script name for filename', () => {
      const filename = curlRunner.generateLogFilename('test-script@#$%.sh');
      assert.match(filename, /^test-script____\.log$/);
    });
  });

  describe('writeLog', () => {
    it('should write log entry to file', () => {
      const logFile = 'test.log';
      const entry = 'Test log entry';
      
      curlRunner.writeLog(logFile, entry);
      
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      assert.strictEqual(call[0], path.join(testLogsDir, logFile));
      assert.match(call[1], /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Test log entry\n$/);
    });

    it('should handle write errors gracefully', () => {
      const consoleSpy = mock.fn();
      const originalError = console.error;
      console.error = consoleSpy;
      
      mockFs.appendFileSync.mock.mockImplementation(() => {
        throw new Error('Write failed');
      });
      
      curlRunner.writeLog('test.log', 'Test entry');
      
      assert.strictEqual(consoleSpy.mock.callCount(), 1);
      assert.match(consoleSpy.mock.calls[0][0], /Error writing to log file: Write failed/);
      
      console.error = originalError;
    });
  });

  describe('writeReportLog', () => {
    it('should write report log entry', () => {
      const entry = 'Test report entry';
      
      curlRunner.writeReportLog(entry);
      
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      assert.strictEqual(call[0], path.join(testLogsDir, 'curl-runner-report.log'));
      assert.match(call[1], /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Test report entry\n$/);
    });
  });

  describe('writeErrorLog', () => {
    it('should write error log entry with basic info', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'Test error';
      
      curlRunner.writeErrorLog(scriptName, errorDetails);
      
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      const logContent = call[1];
      assert.match(logContent, /❌ API ERROR: test-script\.sh/);
    });

    it('should write error log entry with HTTP status and duration', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'HTTP 404 error';
      const httpStatus = 404;
      const duration = 1500;
      
      curlRunner.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
      
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      const logContent = call[1];
      assert.match(logContent, /❌ API ERROR: test-script\.sh \(HTTP 404\) \(1500ms\)/);
    });
  });

  describe('parseCurlOutput', () => {
    it('should parse HTTP status from output', () => {
      const stdout = 'Some output\nHTTP Status: 200\nMore output';
      const stderr = '';
      
      const result = curlRunner.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(result.httpStatus, 200);
      assert.strictEqual(result.isApiError, false);
      assert.strictEqual(result.errorMessage, null);
    });

    it('should detect API errors for 4xx status codes', () => {
      const stdout = 'Some output\nHTTP Status: 404\nMore output';
      const stderr = '';
      
      const result = curlRunner.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(result.httpStatus, 404);
      assert.strictEqual(result.isApiError, true);
      assert.strictEqual(result.errorMessage, 'HTTP 404 error');
    });

    it('should detect API errors for 5xx status codes', () => {
      const stdout = 'Some output\nHTTP Status: 500\nMore output';
      const stderr = '';
      
      const result = curlRunner.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(result.httpStatus, 500);
      assert.strictEqual(result.isApiError, true);
      assert.strictEqual(result.errorMessage, 'HTTP 500 error');
    });

    it('should use stderr as error message when available', () => {
      const stdout = 'Some output\nHTTP Status: 404\nMore output';
      const stderr = 'Connection timeout';
      
      const result = curlRunner.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(result.httpStatus, 404);
      assert.strictEqual(result.isApiError, true);
      assert.strictEqual(result.errorMessage, 'Connection timeout');
    });
  });

  describe('scanScripts', () => {
    it('should return list of .sh files', () => {
      const scripts = curlRunner.scanScripts();
      
      assert.deepStrictEqual(scripts, ['test-script.sh', 'another-script.sh']);
      assert.strictEqual(mockFs.readdirSync.mock.callCount(), 1);
    });

    it('should create scripts directory if it does not exist', () => {
      mockFs.existsSync.mock.mockImplementation(() => false);
      
      const scripts = curlRunner.scanScripts();
      
      assert.strictEqual(mockFs.mkdirSync.mock.callCount(), 1);
      assert.deepStrictEqual(scripts, []);
    });

    it('should handle readdir errors gracefully', () => {
      const consoleSpy = mock.fn();
      const originalError = console.error;
      console.error = consoleSpy;
      
      mockFs.readdirSync.mock.mockImplementation(() => {
        throw new Error('Read failed');
      });
      
      const scripts = curlRunner.scanScripts();
      
      assert.deepStrictEqual(scripts, []);
      assert.strictEqual(consoleSpy.mock.callCount(), 1);
      assert.match(consoleSpy.mock.calls[0][0], /Error scanning directory: Read failed/);
      
      console.error = originalError;
    });

    it('should filter only .sh files', () => {
      mockFs.readdirSync.mock.mockImplementation(() => ['script1.sh', 'script2.txt', 'script3.sh', 'README.md']);
      
      const scripts = curlRunner.scanScripts();
      
      assert.deepStrictEqual(scripts, ['script1.sh', 'script3.sh']);
    });
  });

  describe('runScript', () => {
    it('should return false if script does not exist', async () => {
      mockFs.existsSync.mock.mockImplementation(() => false);
      
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