import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Mock fs for CLI tests
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

describe('CLI Integration Tests', () => {
  const testScriptsDir = './test-scripts';
  const testLogsDir = './test-logs';

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['test-script.sh', 'another-script.sh']);
    fs.mkdirSync.mockImplementation(() => {});
    fs.appendFileSync.mockImplementation(() => {});
  });

  describe('list command', () => {
    test('should list available scripts', (done) => {
      const child = spawn('node', ['index.js', 'list'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Found 2 .sh files');
        expect(output).toContain('test-script.sh');
        expect(output).toContain('another-script.sh');
        done();
      });
    });

    test('should handle custom scripts directory', (done) => {
      const child = spawn('node', ['index.js', 'list', '-d', './custom-scripts'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        done();
      });
    });
  });

  describe('run-script command', () => {
    test('should run specific script', (done) => {
      // Mock successful script execution
      const { exec } = require('child_process');
      exec.mockImplementation((command, callback) => {
        callback(null, 'Test output\nHTTP Status: 200\n', '');
      });

      const child = spawn('node', ['index.js', 'run-script', 'test-script'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Running script: test-script.sh');
        expect(output).toContain('completed successfully');
        done();
      });
    });

    test('should handle script not found', (done) => {
      fs.existsSync.mockReturnValue(false);

      const child = spawn('node', ['index.js', 'run-script', 'nonexistent'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Script nonexistent.sh not found');
        done();
      });
    });
  });

  describe('run command', () => {
    test('should run all scripts', (done) => {
      // Mock successful script executions
      const { exec } = require('child_process');
      exec.mockImplementation((command, callback) => {
        callback(null, 'Test output\nHTTP Status: 200\n', '');
      });

      const child = spawn('node', ['index.js', 'run'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Running 2 script(s)');
        expect(output).toContain('Summary:');
        expect(output).toContain('Successful: 2');
        done();
      });
    });

    test('should handle no scripts found', (done) => {
      fs.readdirSync.mockReturnValue([]);

      const child = spawn('node', ['index.js', 'run'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('No .sh files found to run');
        done();
      });
    });
  });

  describe('default behavior', () => {
    test('should run all scripts when no command provided', (done) => {
      // Mock successful script executions
      const { exec } = require('child_process');
      exec.mockImplementation((command, callback) => {
        callback(null, 'Test output\nHTTP Status: 200\n', '');
      });

      const child = spawn('node', ['index.js'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Running 2 script(s)');
        done();
      });
    });
  });

  describe('error handling', () => {
    test('should handle script execution errors', (done) => {
      const { exec } = require('child_process');
      exec.mockImplementation((command, callback) => {
        callback(new Error('Script execution failed'), '', 'Error output');
      });

      const child = spawn('node', ['index.js', 'run-script', 'error-script'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Error executing error-script.sh');
        done();
      });
    });

    test('should handle API errors', (done) => {
      const { exec } = require('child_process');
      exec.mockImplementation((command, callback) => {
        callback(null, 'Some output\nHTTP Status: 404\nMore output', '');
      });

      const child = spawn('node', ['index.js', 'run-script', 'api-error-script'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('API Error: HTTP 404');
        done();
      });
    });
  });
});