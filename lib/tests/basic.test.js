import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CurlRunner, Logger, CurlParser, FileSystem, DEFAULT_CONFIG } from '../src/index.js';

describe('@curl-runner/core Library', () => {
  describe('CurlRunner', () => {
    test('should create instance with default config', () => {
      const runner = new CurlRunner();
      assert.ok(runner);
      assert.strictEqual(typeof runner.runAllScripts, 'function');
      assert.strictEqual(typeof runner.runScript, 'function');
      assert.strictEqual(typeof runner.scanScripts, 'function');
    });

    test('should create instance with custom config', () => {
      const config = {
        scriptsDir: './custom-scripts',
        logsDir: './custom-logs'
      };
      const runner = new CurlRunner(config);
      assert.ok(runner);
    });
  });

  describe('Logger', () => {
    test('should create logger instance', () => {
      const logger = new Logger('./test-logs');
      assert.ok(logger);
      assert.strictEqual(typeof logger.writeLog, 'function');
      assert.strictEqual(typeof logger.writeReportLog, 'function');
      assert.strictEqual(typeof logger.writeErrorLog, 'function');
    });
  });

  describe('CurlParser', () => {
    test('should parse cURL output', () => {
      const output = 'HTTP Status: 200\n{"message": "success"}';
      
      const result = CurlParser.parseCurlOutput(output);
      assert.ok(result);
      assert.strictEqual(typeof result.httpStatus, 'number');
      assert.strictEqual(typeof result.isApiError, 'boolean');
    });

    test('should extract HTTP status', () => {
      const output = 'HTTP/1.1 200 OK\n{"message": "success"}';
      
      const status = CurlParser.extractHttpStatus(output);
      assert.strictEqual(status, 200);
    });

    test('should detect HTTP errors', () => {
      assert.strictEqual(CurlParser.isHttpError(200), false);
      assert.strictEqual(CurlParser.isHttpError(404), true);
      assert.strictEqual(CurlParser.isHttpError(500), true);
    });
  });

  describe('FileSystem', () => {
    test('should have static methods', () => {
      assert.strictEqual(typeof FileSystem.scanScripts, 'function');
      assert.strictEqual(typeof FileSystem.fileExists, 'function');
      assert.strictEqual(typeof FileSystem.ensureDirectory, 'function');
    });
  });

  describe('Configuration', () => {
    test('should export default config', () => {
      assert.ok(DEFAULT_CONFIG);
      assert.strictEqual(typeof DEFAULT_CONFIG.SCRIPTS_DIR, 'string');
      assert.strictEqual(typeof DEFAULT_CONFIG.LOGS_DIR, 'string');
      assert.strictEqual(typeof DEFAULT_CONFIG.SCRIPT_DELAY_MS, 'number');
    });
  });
});