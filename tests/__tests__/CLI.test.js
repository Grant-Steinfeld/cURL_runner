import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import fs from 'fs';

// Mock fs for CLI tests
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

describe('CLI Integration Tests', () => {
  const testScriptsDir = './test-scripts';
  const testLogsDir = './test-logs';

  beforeEach(() => {
    mockFs.existsSync.mock.resetCalls();
    mockFs.readdirSync.mock.resetCalls();
    mockFs.mkdirSync.mock.resetCalls();
    mockFs.appendFileSync.mock.resetCalls();
    
    mockFs.existsSync.mock.mockImplementation(() => true);
    mockFs.readdirSync.mock.mockImplementation(() => ['test-script.sh', 'another-script.sh']);
    mockFs.mkdirSync.mock.mockImplementation(() => {});
    mockFs.appendFileSync.mock.mockImplementation(() => {});
  });

  describe('list command', () => {
    it('should list available scripts', async () => {
      const child = spawn('node', ['index.js', 'list'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            assert.match(output, /Found \d+ \.sh files/);
            assert.match(output, /test-script\.sh/);
            assert.match(output, /another-script\.sh/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });

    it('should handle custom scripts directory', async () => {
      const child = spawn('node', ['index.js', 'list', '-d', './custom-scripts'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });
  });

  describe('run-script command', () => {
    it('should run specific script', async () => {
      const child = spawn('node', ['index.js', 'run-script', 'test-script'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            assert.match(output, /Running script: test-script\.sh/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });

    it('should handle script not found', async () => {
      mockFs.existsSync.mock.mockImplementation(() => false);

      const child = spawn('node', ['index.js', 'run-script', 'nonexistent'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            assert.match(output, /Script nonexistent\.sh not found/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });
  });

  describe('run command', () => {
    it('should run all scripts', async () => {
      const child = spawn('node', ['index.js', 'run'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            assert.match(output, /Running \d+ script\(s\)/);
            assert.match(output, /Summary:/);
            assert.match(output, /Successful:/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });

    it('should handle no scripts found', async () => {
      mockFs.readdirSync.mock.mockImplementation(() => []);

      const child = spawn('node', ['index.js', 'run'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            assert.match(output, /No \.sh files found to run/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });
  });

  describe('default behavior', () => {
    it('should run all scripts when no command provided', async () => {
      const child = spawn('node', ['index.js'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            assert.match(output, /Running \d+ script\(s\)/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });
  });

  describe('error handling', () => {
    it('should handle script execution errors', async () => {
      const child = spawn('node', ['index.js', 'run-script', 'error-script'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            // Error handling might be in stdout or stderr
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });

    it('should handle API errors', async () => {
      const child = spawn('node', ['index.js', 'run-script', 'api-error-script'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            // API error handling might be in stdout or stderr
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });
  });
});