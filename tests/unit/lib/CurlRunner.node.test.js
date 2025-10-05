import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

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

// Import our class after mocking
const { CurlRunner } = await import('../../../src/lib/CurlRunner.js');

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
  });
});