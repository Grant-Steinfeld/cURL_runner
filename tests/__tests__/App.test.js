import { spawn } from 'child_process';
import fs from 'fs';

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

describe('Application Entry Point', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['test-script.sh']);
    fs.mkdirSync.mockImplementation(() => {});
    fs.appendFileSync.mockImplementation(() => {});
  });

  describe('Application Startup', () => {
    test('should start without errors', (done) => {
      const child = spawn('node', ['index.js', '--help'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('curl-runner');
        expect(output).toContain('Run cURL scripts from .sh files');
        done();
      });
    });

    test('should show version information', (done) => {
      const child = spawn('node', ['index.js', '--version'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('1.0.0');
        done();
      });
    });
  });

  describe('Command Line Interface', () => {
    test('should handle invalid commands gracefully', (done) => {
      const child = spawn('node', ['index.js', 'invalid-command'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(1);
        expect(output).toContain('unknown command');
        done();
      });
    });

    test('should show help for run command', (done) => {
      const child = spawn('node', ['index.js', 'run', '--help'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Run all .sh files in the scripts directory');
        expect(output).toContain('-d, --dir <directory>');
        expect(output).toContain('-l, --logs <directory>');
        done();
      });
    });

    test('should show help for run-script command', (done) => {
      const child = spawn('node', ['index.js', 'run-script', '--help'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Run a specific .sh file');
        expect(output).toContain('<script>');
        done();
      });
    });

    test('should show help for list command', (done) => {
      const child = spawn('node', ['index.js', 'list', '--help'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('List all available .sh files');
        done();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing scripts directory gracefully', (done) => {
      fs.existsSync.mockReturnValue(false);
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Directory not found');
      });

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
        expect(output).toContain('No .sh files found to run');
        done();
      });
    });

    test('should handle permission errors gracefully', (done) => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

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
        expect(output).toContain('No .sh files found to run');
        done();
      });
    });
  });

  describe('Default Behavior', () => {
    test('should run all scripts when no arguments provided', (done) => {
      // Mock successful script execution
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
        expect(output).toContain('Running 1 script(s)');
        done();
      });
    });
  });
});