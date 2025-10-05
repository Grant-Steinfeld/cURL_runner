import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { Logger } from '../../../src/utils/logger.js';

// Mock fs
const mockFs = {
  existsSync: mock.fn(),
  mkdirSync: mock.fn(),
  appendFileSync: mock.fn()
};

// Replace the real fs with mock
Object.defineProperty(process, 'fs', {
  value: mockFs,
  writable: true
});

describe('Logger', () => {
  let logger;
  const testLogsDir = './test-logs';

  beforeEach(() => {
    mockFs.existsSync.mock.resetCalls();
    mockFs.mkdirSync.mock.resetCalls();
    mockFs.appendFileSync.mock.resetCalls();
    
    mockFs.existsSync.mock.mockImplementation(() => true);
    mockFs.mkdirSync.mock.mockImplementation(() => {});
    mockFs.appendFileSync.mock.mockImplementation(() => {});
    
    logger = new Logger(testLogsDir);
  });

  describe('Constructor', () => {
    it('should initialize with logs directory', () => {
      assert.strictEqual(logger.logsDir, testLogsDir);
      assert.strictEqual(logger.reportLogFile, 'curl-runner-report.log');
      assert.strictEqual(logger.errorLogFile, 'curl-api-errors.log');
    });
  });

  describe('ensureLogsDirectory', () => {
    it('should create directory if it does not exist', () => {
      mockFs.existsSync.mock.mockImplementation(() => false);
      
      logger.ensureLogsDirectory();
      
      assert.strictEqual(mockFs.mkdirSync.mock.callCount(), 1);
      const call = mockFs.mkdirSync.mock.calls[0];
      assert.strictEqual(call[0], testLogsDir);
      assert.deepStrictEqual(call[1], { recursive: true });
    });

    it('should not create directory if it exists', () => {
      mockFs.existsSync.mock.mockImplementation(() => true);
      
      logger.ensureLogsDirectory();
      
      assert.strictEqual(mockFs.mkdirSync.mock.callCount(), 0);
    });
  });

  describe('generateLogFilename', () => {
    it('should generate filename with timestamp for batch runs', () => {
      const filename = logger.generateLogFilename();
      assert.match(filename, /^run_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    it('should generate filename with script name and timestamp', () => {
      const filename = logger.generateLogFilename('test-script.sh');
      assert.match(filename, /^test-script_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    it('should clean script name for filename', () => {
      const filename = logger.generateLogFilename('test-script@#$%.sh');
      assert.match(filename, /^test-script____\.log$/);
    });
  });

  describe('writeLog', () => {
    it('should write log entry to file', () => {
      const logFile = 'test.log';
      const entry = 'Test log entry';
      
      logger.writeLog(logFile, entry);
      
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
      
      logger.writeLog('test.log', 'Test entry');
      
      assert.strictEqual(consoleSpy.mock.callCount(), 1);
      assert.match(consoleSpy.mock.calls[0][0], /Error writing to log file: Write failed/);
      
      console.error = originalError;
    });
  });

  describe('writeReportLog', () => {
    it('should write report log entry', () => {
      const entry = 'Test report entry';
      
      logger.writeReportLog(entry);
      
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
      
      logger.writeErrorLog(scriptName, errorDetails);
      
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
      
      logger.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
      
      assert.strictEqual(mockFs.appendFileSync.mock.callCount(), 1);
      const call = mockFs.appendFileSync.mock.calls[0];
      const logContent = call[1];
      assert.match(logContent, /❌ API ERROR: test-script\.sh \(HTTP 404\) \(1500ms\)/);
    });
  });
});