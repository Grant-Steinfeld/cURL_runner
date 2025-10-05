import fs from 'fs';
import path from 'path';
import { CurlRunner } from '../../index.js';

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

describe('Logging System', () => {
  let curlRunner;
  const testLogsDir = './test-logs';

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue([]);
    fs.mkdirSync.mockImplementation(() => {});
    fs.appendFileSync.mockImplementation(() => {});
    
    curlRunner = new CurlRunner('./test-scripts', testLogsDir);
  });

  describe('Log File Creation', () => {
    test('should create detailed log file for batch runs', () => {
      const logFile = curlRunner.generateLogFilename();
      
      expect(logFile).toMatch(/^run_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    test('should create detailed log file for individual scripts', () => {
      const logFile = curlRunner.generateLogFilename('test-script.sh');
      
      expect(logFile).toMatch(/^test-script_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.log$/);
    });

    test('should create report log file', () => {
      expect(curlRunner.reportLogFile).toBe('curl-runner-report.log');
    });

    test('should create error log file', () => {
      expect(curlRunner.errorLogFile).toBe('curl-api-errors.log');
    });
  });

  describe('Log Entry Formatting', () => {
    test('should format detailed log entries with timestamps', () => {
      const logFile = 'test.log';
      const entry = 'Test log entry';
      
      curlRunner.writeLog(logFile, entry);
      
      const expectedPath = path.join(testLogsDir, logFile);
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expectedPath,
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Test log entry\n$/)
      );
    });

    test('should format report log entries with timestamps', () => {
      const entry = 'Test report entry';
      
      curlRunner.writeReportLog(entry);
      
      const expectedPath = path.join(testLogsDir, 'curl-runner-report.log');
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expectedPath,
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] Test report entry\n$/)
      );
    });

    test('should format error log entries with proper structure', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'HTTP 404 error';
      const httpStatus = 404;
      const duration = 1500;
      
      curlRunner.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
      
      const expectedPath = path.join(testLogsDir, 'curl-api-errors.log');
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expectedPath,
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] ❌ API ERROR: test-script\.sh \(HTTP 404\) \(1500ms\)\n/)
      );
    });
  });

  describe('Log Directory Management', () => {
    test('should create logs directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      
      new CurlRunner('./test-scripts', testLogsDir);
      
      expect(fs.mkdirSync).toHaveBeenCalledWith(testLogsDir, { recursive: true });
    });

    test('should not create logs directory if it already exists', () => {
      fs.existsSync.mockReturnValue(true);
      
      new CurlRunner('./test-scripts', testLogsDir);
      
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling in Logging', () => {
    test('should handle write errors in detailed logs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });
      
      curlRunner.writeLog('test.log', 'Test entry');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error writing to log file: Write failed');
      consoleSpy.mockRestore();
    });

    test('should handle write errors in report logs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('Report write failed');
      });
      
      curlRunner.writeReportLog('Test report');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error writing to report log: Report write failed');
      consoleSpy.mockRestore();
    });

    test('should handle write errors in error logs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('Error log write failed');
      });
      
      curlRunner.writeErrorLog('test.sh', 'Error details');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error writing to error log: Error log write failed');
      consoleSpy.mockRestore();
    });
  });

  describe('Log File Naming', () => {
    test('should clean script names for log filenames', () => {
      const testCases = [
        { input: 'test-script.sh', expected: 'test-script' },
        { input: 'script@#$%.sh', expected: 'script____' },
        { input: 'my_script-v1.sh', expected: 'my_script-v1' },
        { input: 'script with spaces.sh', expected: 'script_with_spaces' }
      ];

      testCases.forEach(({ input, expected }) => {
        const filename = curlRunner.generateLogFilename(input);
        expect(filename).toMatch(new RegExp(`^${expected}_\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}\\.log$`));
      });
    });

    test('should generate unique filenames for different timestamps', () => {
      const filename1 = curlRunner.generateLogFilename('test.sh');
      
      // Wait a small amount to ensure different timestamp
      const filename2 = curlRunner.generateLogFilename('test.sh');
      
      expect(filename1).not.toBe(filename2);
    });
  });

  describe('Log Content Structure', () => {
    test('should include all required elements in error log', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'Connection timeout';
      const httpStatus = 500;
      const duration = 3000;
      
      curlRunner.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
      
      const call = fs.appendFileSync.mock.calls[0];
      const logContent = call[1];
      
      expect(logContent).toContain('❌ API ERROR: test-script.sh');
      expect(logContent).toContain('(HTTP 500)');
      expect(logContent).toContain('(3000ms)');
      expect(logContent).toContain('Error: Connection timeout');
      expect(logContent).toContain('─────────────────────────────────────────');
    });

    test('should handle error log without HTTP status', () => {
      const scriptName = 'test-script.sh';
      const errorDetails = 'Script execution failed';
      
      curlRunner.writeErrorLog(scriptName, errorDetails);
      
      const call = fs.appendFileSync.mock.calls[0];
      const logContent = call[1];
      
      expect(logContent).toContain('❌ API ERROR: test-script.sh');
      expect(logContent).not.toContain('(HTTP');
      expect(logContent).toContain('Error: Script execution failed');
    });
  });
});