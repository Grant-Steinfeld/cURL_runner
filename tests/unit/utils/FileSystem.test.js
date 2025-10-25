import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { FileSystem } from '../../../src/utils/fileSystem.js';

// Mock fs
const mockFs = {
  existsSync: mock.fn(),
  readdirSync: mock.fn(),
  mkdirSync: mock.fn()
};

// Replace the real fs with mock
Object.defineProperty(process, 'fs', {
  value: mockFs,
  writable: true
});

describe('FileSystem', () => {
  const testScriptsDir = './cURL_scripts';

  beforeEach(() => {
    mockFs.existsSync.mock.resetCalls();
    mockFs.readdirSync.mock.resetCalls();
    mockFs.mkdirSync.mock.resetCalls();
    
    mockFs.existsSync.mock.mockImplementation(() => true);
    mockFs.readdirSync.mock.mockImplementation(() => ['test-script.sh', 'another-script.sh']);
    mockFs.mkdirSync.mock.mockImplementation(() => {});
  });

  describe('scanScripts', () => {
    it('should return list of .sh files', () => {
      const scripts = FileSystem.scanScripts(testScriptsDir);
      
      assert.deepStrictEqual(scripts, ['test-script.sh', 'another-script.sh']);
      assert.strictEqual(mockFs.readdirSync.mock.callCount(), 1);
      const call = mockFs.readdirSync.mock.calls[0];
      assert.strictEqual(call[0], testScriptsDir);
    });

    it('should create scripts directory if it does not exist', () => {
      mockFs.existsSync.mock.mockImplementation(() => false);
      
      const scripts = FileSystem.scanScripts(testScriptsDir);
      
      assert.strictEqual(mockFs.mkdirSync.mock.callCount(), 1);
      const call = mockFs.mkdirSync.mock.calls[0];
      assert.strictEqual(call[0], testScriptsDir);
      assert.deepStrictEqual(call[1], { recursive: true });
      assert.deepStrictEqual(scripts, []);
    });

    it('should handle readdir errors gracefully', () => {
      const consoleSpy = mock.fn();
      const originalError = console.error;
      console.error = consoleSpy;
      
      mockFs.readdirSync.mock.mockImplementation(() => {
        throw new Error('Read failed');
      });
      
      const scripts = FileSystem.scanScripts(testScriptsDir);
      
      assert.deepStrictEqual(scripts, []);
      assert.strictEqual(consoleSpy.mock.callCount(), 1);
      assert.match(consoleSpy.mock.calls[0][0], /❌ Error scanning directory.*Read failed/);
      
      console.error = originalError;
    });

    it('should filter only .sh files', () => {
      mockFs.readdirSync.mock.mockImplementation(() => ['script1.sh', 'script2.txt', 'script3.sh', 'README.md']);
      
      const scripts = FileSystem.scanScripts(testScriptsDir);
      
      assert.deepStrictEqual(scripts, ['script1.sh', 'script3.sh']);
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', () => {
      mockFs.existsSync.mock.mockImplementation(() => true);
      
      const exists = FileSystem.fileExists('/path/to/file');
      
      assert.strictEqual(exists, true);
      assert.strictEqual(mockFs.existsSync.mock.callCount(), 1);
      const call = mockFs.existsSync.mock.calls[0];
      assert.strictEqual(call[0], '/path/to/file');
    });

    it('should return false if file does not exist', () => {
      mockFs.existsSync.mock.mockImplementation(() => false);
      
      const exists = FileSystem.fileExists('/path/to/file');
      
      assert.strictEqual(exists, false);
    });
  });

  describe('ensureDirectory', () => {
    it('should create directory if it does not exist', () => {
      mockFs.existsSync.mock.mockImplementation(() => false);
      
      const created = FileSystem.ensureDirectory('/path/to/dir');
      
      assert.strictEqual(created, true);
      assert.strictEqual(mockFs.mkdirSync.mock.callCount(), 1);
      const call = mockFs.mkdirSync.mock.calls[0];
      assert.strictEqual(call[0], '/path/to/dir');
      assert.deepStrictEqual(call[1], { recursive: true });
    });

    it('should not create directory if it exists', () => {
      mockFs.existsSync.mock.mockImplementation(() => true);
      
      const created = FileSystem.ensureDirectory('/path/to/dir');
      
      assert.strictEqual(created, false);
      assert.strictEqual(mockFs.mkdirSync.mock.callCount(), 0);
    });
  });

  describe('joinPath', () => {
    it('should join paths correctly', () => {
      const result = FileSystem.joinPath('/path', 'to', 'file');
      assert.strictEqual(result, path.join('/path', 'to', 'file'));
    });
  });

  describe('getFileExtension', () => {
    it('should return file extension', () => {
      const ext = FileSystem.getFileExtension('test.sh');
      assert.strictEqual(ext, '.sh');
    });
  });

  describe('getDirName', () => {
    it('should return directory name', () => {
      const dir = FileSystem.getDirName('/path/to/file.sh');
      assert.strictEqual(dir, path.dirname('/path/to/file.sh'));
    });
  });

  describe('getBaseName', () => {
    it('should return base name', () => {
      const base = FileSystem.getBaseName('/path/to/file.sh');
      assert.strictEqual(base, path.basename('/path/to/file.sh'));
    });
  });
});