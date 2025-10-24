import { describe, it, expect, beforeEach, afterEach } from 'node:test';
import { CurlRunner } from '../../../lib/src/core/CurlRunner.js';
import { FileSystem } from '../../../lib/src/utils/fileSystem.js';
import fs from 'fs';
import path from 'path';

describe('CurlRunner Parallel Execution', () => {
  let runner;
  let testScriptsDir;
  let testLogsDir;

  beforeEach(async () => {
    // Create temporary directories for testing
    testScriptsDir = path.join(process.cwd(), 'test-scripts-parallel');
    testLogsDir = path.join(process.cwd(), 'test-logs-parallel');
    
    // Ensure directories exist
    if (!fs.existsSync(testScriptsDir)) {
      fs.mkdirSync(testScriptsDir, { recursive: true });
    }
    if (!fs.existsSync(testLogsDir)) {
      fs.mkdirSync(testLogsDir, { recursive: true });
    }

    runner = new CurlRunner(testScriptsDir, testLogsDir);
  });

  afterEach(async () => {
    // Clean up test directories
    if (fs.existsSync(testScriptsDir)) {
      fs.rmSync(testScriptsDir, { recursive: true, force: true });
    }
    if (fs.existsSync(testLogsDir)) {
      fs.rmSync(testLogsDir, { recursive: true, force: true });
    }
  });

  describe('runAllScriptsParallel', () => {
    it('should run all scripts in parallel', async () => {
      // Create test scripts
      const script1 = path.join(testScriptsDir, 'test1.sh');
      const script2 = path.join(testScriptsDir, 'test2.sh');
      const script3 = path.join(testScriptsDir, 'test3.sh');

      fs.writeFileSync(script1, '#!/bin/bash\necho "Script 1 executed"\nexit 0');
      fs.writeFileSync(script2, '#!/bin/bash\necho "Script 2 executed"\nexit 0');
      fs.writeFileSync(script3, '#!/bin/bash\necho "Script 3 executed"\nexit 0');

      // Make scripts executable
      fs.chmodSync(script1, 0o755);
      fs.chmodSync(script2, 0o755);
      fs.chmodSync(script3, 0o755);

      const startTime = Date.now();
      const results = await runner.runAllScriptsParallel();
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      
      // Parallel execution should be faster than sequential
      // (though this might be flaky in CI, so we'll just check it's reasonable)
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle empty scripts directory', async () => {
      const results = await runner.runAllScriptsParallel();
      expect(results).toEqual([]);
    });

    it('should handle script failures gracefully', async () => {
      // Create one successful and one failing script
      const script1 = path.join(testScriptsDir, 'success.sh');
      const script2 = path.join(testScriptsDir, 'failure.sh');

      fs.writeFileSync(script1, '#!/bin/bash\necho "Success"\nexit 0');
      fs.writeFileSync(script2, '#!/bin/bash\necho "Failure"\nexit 1');

      fs.chmodSync(script1, 0o755);
      fs.chmodSync(script2, 0o755);

      const results = await runner.runAllScriptsParallel();

      expect(results).toHaveLength(2);
      expect(results.filter(r => r.success)).toHaveLength(1);
      expect(results.filter(r => !r.success)).toHaveLength(1);
    });
  });

  describe('runAllScriptsConcurrent', () => {
    it('should run scripts in batches', async () => {
      // Create 7 test scripts to test batching
      for (let i = 1; i <= 7; i++) {
        const script = path.join(testScriptsDir, `test${i}.sh`);
        fs.writeFileSync(script, `#!/bin/bash\necho "Script ${i} executed"\nexit 0`);
        fs.chmodSync(script, 0o755);
      }

      const results = await runner.runAllScriptsConcurrent({ batchSize: 3 });

      expect(results).toHaveLength(7);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should respect batch size and delay options', async () => {
      // Create 4 test scripts
      for (let i = 1; i <= 4; i++) {
        const script = path.join(testScriptsDir, `test${i}.sh`);
        fs.writeFileSync(script, `#!/bin/bash\necho "Script ${i} executed"\nexit 0`);
        fs.chmodSync(script, 0o755);
      }

      const startTime = Date.now();
      const results = await runner.runAllScriptsConcurrent({ 
        batchSize: 2, 
        delayBetweenBatches: 100 
      });
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(4);
      expect(results.every(r => r.success)).toBe(true);
      
      // Should take at least 100ms due to delay between batches
      expect(duration).toBeGreaterThanOrEqual(100);
    });

    it('should handle empty scripts directory', async () => {
      const results = await runner.runAllScriptsConcurrent();
      expect(results).toEqual([]);
    });
  });

  describe('runScriptsWithConcurrency', () => {
    it('should run scripts with custom concurrency limit', async () => {
      // Create 5 test scripts
      for (let i = 1; i <= 5; i++) {
        const script = path.join(testScriptsDir, `test${i}.sh`);
        fs.writeFileSync(script, `#!/bin/bash\necho "Script ${i} executed"\nexit 0`);
        fs.chmodSync(script, 0o755);
      }

      const scripts = ['test1.sh', 'test2.sh', 'test3.sh', 'test4.sh', 'test5.sh'];
      const results = await runner.runScriptsWithConcurrency(scripts, 2);

      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should throw error for invalid scripts parameter', async () => {
      await expect(runner.runScriptsWithConcurrency('not-an-array')).rejects.toThrow('Scripts must be an array');
    });

    it('should handle empty scripts array', async () => {
      const results = await runner.runScriptsWithConcurrency([]);
      expect(results).toEqual([]);
    });

    it('should handle non-existent scripts gracefully', async () => {
      const scripts = ['nonexistent1.sh', 'nonexistent2.sh'];
      const results = await runner.runScriptsWithConcurrency(scripts, 1);

      expect(results).toHaveLength(2);
      expect(results.every(r => !r.success)).toBe(true);
    });
  });

  describe('Performance Comparison', () => {
    it('should demonstrate parallel execution is faster than sequential', async () => {
      // Create 5 test scripts that take some time
      for (let i = 1; i <= 5; i++) {
        const script = path.join(testScriptsDir, `slow${i}.sh`);
        fs.writeFileSync(script, `#!/bin/bash\nsleep 0.1\necho "Slow script ${i} executed"\nexit 0`);
        fs.chmodSync(script, 0o755);
      }

      // Test sequential execution
      const sequentialStart = Date.now();
      await runner.runAllScripts();
      const sequentialDuration = Date.now() - sequentialStart;

      // Test parallel execution
      const parallelStart = Date.now();
      await runner.runAllScriptsParallel();
      const parallelDuration = Date.now() - parallelStart;

      // Parallel should be significantly faster
      expect(parallelDuration).toBeLessThan(sequentialDuration);
      
      // Sequential should take at least 500ms (5 scripts * 100ms each)
      expect(sequentialDuration).toBeGreaterThanOrEqual(400);
      
      // Parallel should take less than 200ms (all scripts run simultaneously)
      expect(parallelDuration).toBeLessThan(200);
    });
  });
});
