import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import fs from 'fs';

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

describe('Application Entry Point', () => {
  beforeEach(() => {
    mockFs.existsSync.mock.resetCalls();
    mockFs.readdirSync.mock.resetCalls();
    mockFs.mkdirSync.mock.resetCalls();
    mockFs.appendFileSync.mock.resetCalls();
    
    mockFs.existsSync.mock.mockImplementation(() => true);
    mockFs.readdirSync.mock.mockImplementation(() => ['test-script.sh']);
    mockFs.mkdirSync.mock.mockImplementation(() => {});
    mockFs.appendFileSync.mock.mockImplementation(() => {});
  });

  describe('Application Startup', () => {
    it('should start without errors', async () => {
      const child = spawn('node', ['index.js', '--help'], {
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
            assert.match(output, /curl-runner/);
            assert.match(output, /Run cURL scripts from \.sh files/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });

    it('should show version information', async () => {
      const child = spawn('node', ['index.js', '--version'], {
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
            assert.match(output, /1\.0\.0/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });
  });

  describe('Command Line Interface', () => {
    it('should handle invalid commands gracefully', async () => {
      const child = spawn('node', ['index.js', 'invalid-command'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 1) {
            assert.match(output, /unknown command/);
            resolve();
          } else {
            reject(new Error(`Expected exit code 1, got ${code}`));
          }
        });
      });
    });

    it('should show help for run command', async () => {
      const child = spawn('node', ['index.js', 'run', '--help'], {
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
            assert.match(output, /Run all \.sh files in the scripts directory/);
            assert.match(output, /-d, --dir <directory>/);
            assert.match(output, /-l, --logs <directory>/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });

    it('should show help for run-script command', async () => {
      const child = spawn('node', ['index.js', 'run-script', '--help'], {
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
            assert.match(output, /Run a specific \.sh file/);
            assert.match(output, /<script>/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });

    it('should show help for list command', async () => {
      const child = spawn('node', ['index.js', 'list', '--help'], {
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
            assert.match(output, /List all available \.sh files/);
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing scripts directory gracefully', async () => {
      mockFs.existsSync.mock.mockImplementation(() => false);
      mockFs.readdirSync.mock.mockImplementation(() => {
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

    it('should handle permission errors gracefully', async () => {
      mockFs.existsSync.mock.mockImplementation(() => true);
      mockFs.readdirSync.mock.mockImplementation(() => {
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

  describe('Default Behavior', () => {
    it('should run all scripts when no arguments provided', async () => {
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
});