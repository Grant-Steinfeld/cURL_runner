import { CurlRunner as CurlRunnerClass } from './src/lib/CurlRunner.js';
import { DEFAULT_CONFIG } from './src/config/defaults.js';

/**
 * Export the underlying CurlRunner class for direct consumption.
 */
export const CurlRunner = CurlRunnerClass;

/**
 * Convenience factory that applies sensible defaults.
 */
export function createRunner(options = {}) {
  const scriptsDir = options.scriptsDir ?? options.dir ?? DEFAULT_CONFIG.SCRIPTS_DIR;
  const logsDir = options.logsDir ?? options.logs ?? DEFAULT_CONFIG.LOGS_DIR;
  return new CurlRunnerClass(scriptsDir, logsDir);
}

/**
 * Run every script sequentially.
 */
export function runAllScripts(options = {}) {
  const runner = createRunner(options);
  return runner.runAllScripts();
}

/**
 * Run an individual script (with optional .sh suffix).
 */
export function runScript(scriptName, options = {}) {
  if (!scriptName) {
    return Promise.reject(new Error('scriptName is required'));
  }
  const runner = createRunner(options);
  return runner.runSpecificScript(scriptName);
}

/**
 * Run every script with unlimited parallelism.
 */
export function runAllScriptsParallel(options = {}) {
  const runner = createRunner(options);
  return runner.runAllScriptsParallel();
}

/**
 * Run every script in controlled batches.
 */
export function runAllScriptsConcurrent(options = {}) {
  const runner = createRunner(options);
  return runner.runAllScriptsConcurrent({
    batchSize: options.batchSize,
    delayBetweenBatches: options.delayBetweenBatches ?? options.delay
  });
}

/**
 * Run a supplied list of scripts with a maximum concurrency cap.
 */
export function runScriptsWithConcurrency(scripts, maxConcurrent, options = {}) {
  const runner = createRunner(options);
  return runner.runScriptsWithConcurrency(scripts, maxConcurrent);
}

/**
 * List discoverable scripts using the configured directory.
 */
export function listScripts(options = {}) {
  const runner = createRunner(options);
  return runner.listScripts();
}