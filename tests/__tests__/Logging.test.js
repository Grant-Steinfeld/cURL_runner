import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { CurlRunner } from '../../index.js';

// Mock fs
const mockFs = {
  existsSync: mock.fn(),
  readdirSync: mock.fn(),
  mkdirSync: mock.fn(),
  appendFileSync: mock.fn()
};

// Replace the real fs with mock
Object.defineProperty(process, 'fs', {
  value: mockFs,
  writable: true
});

describe('Logging System', () => {
  let curlRunner;
  const testLogsDir = './test-logs';

  beforeEach(() => {
    mockFs.existsSync.mock.resetCalls();
    mockFs.readdirSync.mock.resetCalls();
    mockFs.mkdirSync.mock.resetCalls();
    mockFs.appendFileSync.mock.resetCalls();
    
    mockFs.existsSync.mock.mockImplementation(() => true);
    mockFs.readdirSync.mock.mockImplementation(() => []);
    mockFs.mkdirSync.mock.mockImplementation(() => {});
    mockFs.appendFileSync.mock.mockImplementation(() => {});
    
    curlRunner = new CurlRunner('./test-scripts', testLogsDir);
  });

  describe('Log File Creation', () => {
    it('should create detailed log file for batch runs', () => {
      const logFile = curlRunner.generateLogFilename();
      
      assert.match(logFile, /^run_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    it('should create detailed log file for individual scripts', () => {
      const logFile = curlRunner.generateLogFilename('test-script.sh');
      
      assert.match(logFile, /^test-script_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    it('should create report log file', () => {
      assert.strictEqual(curlRunner.reportLogFile, 'curl-runner-report.log');
    });

    it('should create error log file', () => {
      assert.strictEqual(curlRunner.errorLogFile, 'curl-api-errors.log');
    });
  });

  describe('Log Entry Formatting', () => {
    it('should format detailed log entries with timestamps', () => {
      const logFile = 'test.log';
      const entry = 'Test log entry';
      
      curlRunner.writeLog(logFile, entry);
      
      const expectedPath = path.join(testLogsDir, logFile);
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      assert.strictEqual(call[0], expectedPath);
      assert.match(call[1], /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Test log entry\n$/);
    });

    it('should format report log entries with timestamps', () => {
      const entry = 'Test report entry';
      
      curlRunner.writeReportLog(entry);
      
      const expectedPath = path.join(testLogsDir, 'curl-runner-report.log');
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      assert.strictEqual(call[0], expectedPath);
      assert.match(call[1], /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Test report entry\n$/);
    });

    it('should format error log entries with proper structure', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'HTTP 404 error';
      const httpStatus = 404;
      const duration = 1500;
      
      curlRunner.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
      
      const expectedPath = path.join(testLogsDir, 'curl-api-errors.log');
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      assert.strictEqual(call[0], expectedPath);
      const logContent = call[1];
      assert.match(logContent, /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] ❌ API ERROR: test-script\.sh \(HTTP 404\) \(1500ms\)\n/);
    });
  });

  describe('Log Directory Management', () => {
    it('should create logs directory if it does not exist', () => {
      mockFs.existsSync.mock.mockImplementation(() => false);
      
      new CurlRunner('./test-scripts', testLogsDir);
      
      assert.strictEqual(mockFs.mkdirSync.mock.callCount(), 1);
    });

    it('should not create logs directory if it already exists', () => {
      mockFs.existsSync.mock.mockImplementation(() => true);
      
      new CurlRunner('./test-scripts', testLogsDir);
      
      assert.strictEqual(mockFs.mkdirSync.mock.callCount(), 0);
    });
  });

  describe('Error Handling in Logging', () => {
    it('should handle write errors in detailed logs', () => {
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

    it('should handle write errors in report logs', () => {
      const consoleSpy = mock.fn();
      const originalError = console.error;
      console.error = consoleSpy;
      
      mockFs.appendFileSync.mock.mockImplementation(() => {
        throw new Error('Report write failed');
      });
      
      curlRunner.writeReportLog('Test report');
      
      assert.strictEqual(consoleSpy.mock.callCount(), 1);
      assert.match(consoleSpy.mock.calls[0][0], /Error writing to report log: Report write failed/);
      
      console.error = originalError;
    });

    it('should handle write errors in error logs', () => {
      const consoleSpy = mock.fn();
      const originalError = console.error;
      console.error = consoleSpy;
      
      mockFs.appendFileSync.mock.mockImplementation(() => {
        throw new Error('Error log write failed');
      });
      
      curlRunner.writeErrorLog('test.sh', 'Error details');
      
      assert.strictEqual(consoleSpy.mock.callCount(), 1);
      assert.match(consoleSpy.mock.calls[0][0], /Error writing to error log: Error log write failed/);
      
      console.error = originalError;
    });
  });

  describe('Log File Naming', () => {
    it('should clean script names for log filenames', () => {
      const testCases = [
        { input: 'test-script.sh', expected: 'test-script' },
        { input: 'script@#$%.sh', expected: 'script____' },
        { input: 'my_script-v1.sh', expected: 'my_script-v1' },
        { input: 'script with spaces.sh', expected: 'script_with_spaces' }
      ];

      testCases.forEach(({ input, expected }) => {
        const filename = curlRunner.generateLogFilename(input);
        assert.match(filename, new RegExp(`^${expected}_\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}\\.log$`));
      });
    });

    it('should generate unique filenames for different timestamps', () => {
      const filename1 = curlRunner.generateLogFilename('test.sh');
      
      // Wait a small amount to ensure different timestamp
      const filename2 = curlRunner.generateLogFilename('test.sh');
      
      assert.notStrictEqual(filename1, filename2);
    });
  });

  describe('Log Content Structure', () => {
    it('should include all required elements in error log', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'Connection timeout';
      const httpStatus = 500;
      const duration = 3000;
      
      curlRunner.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
      
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      const logContent = call[1];
      
      assert.match(logContent, /❌ API ERROR: test-script\.sh/);
      assert.match(logContent, /\(HTTP 500\)/);
      assert.match(logContent, /\(3000ms\)/);
      assert.match(logContent, /Error: Connection timeout/);
      assert.match(logContent, /─────────────────────────────────────────/);
    });

    it('should handle error log without HTTP status', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'Script execution failed';
      
      curlRunner.writeErrorLog(scriptName, errorDetails);
      
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      const logContent = call[1];
      
      assert.match(logContent, /❌ API ERROR: test-script\.sh/);
      assert.doesNotMatch(logContent, /\(HTTP/);
      assert.match(logContent, /Error: Script execution failed/);
    });
  });
});