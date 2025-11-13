import { exec } from 'child_process';
import { Logger } from '../utils/logger.js';
import { CurlParser } from '../utils/parser.js';
import { FileSystem } from '../utils/fileSystem.js';
import { DEFAULT_CONFIG } from '../config/defaults.js';

export class CurlRunner {
  constructor(scriptsDir = DEFAULT_CONFIG.SCRIPTS_DIR, logsDir = DEFAULT_CONFIG.LOGS_DIR) {
    this.scriptsDir = scriptsDir;
    this.logsDir = logsDir;
    this.logger = new Logger(logsDir);
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    this.logger.ensureLogsDirectory();
  }

  generateLogFilename(scriptName = null) {
    return this.logger.generateLogFilename(scriptName);
  }

  writeLog(logFile, entry) {
    this.logger.writeLog(logFile, entry);
  }

  writeReportLog(entry) {
    this.logger.writeReportLog(entry);
  }

  writeErrorLog(scriptName, errorDetails, httpStatus = null, duration = null) {
    this.logger.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
  }

  parseCurlOutput(stdout, stderr) {
    return CurlParser.parseCurlOutput(stdout, stderr);
  }

  scanScripts() {
    return FileSystem.scanScripts(this.scriptsDir);
  }

  async runScript(scriptName, logFile = null) {
    const scriptPath = FileSystem.joinPath(this.scriptsDir, scriptName);

    if (!FileSystem.fileExists(scriptPath)) {
      const errorMsg = `Script ${scriptName} not found in ${this.scriptsDir}`;
      console.error(`❌ ${errorMsg}`);
      if (logFile) {
        this.writeLog(logFile, `ERROR: ${errorMsg}`);
      }
      return {
        scriptName,
        success: false,
        error: errorMsg,
        duration: 0,
        httpStatus: null,
        output: '',
        stderr: ''
      };
    }

    console.log(`\n🚀 Running script: ${scriptName}`);
    console.log('─'.repeat(50));

    if (logFile) {
      this.writeLog(logFile, `Starting execution of script: ${scriptName}`);
    }

    return new Promise((resolve) => {
      const startTime = Date.now();

      exec(`bash "${scriptPath}"`, (error, stdout = '', stderr = '') => {
        const duration = Date.now() - startTime;

        if (error) {
          const errorMsg = `Error executing ${scriptName}: ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          if (stderr) {
            console.error('STDERR:', stderr);
          }

          if (logFile) {
            this.writeLog(logFile, `ERROR: ${errorMsg}`);
            if (stderr) {
              this.writeLog(logFile, `STDERR: ${stderr}`);
            }
          }

          this.writeReportLog(`❌ FAILED: ${scriptName} (${duration}ms) - ${error.message}`);
          this.writeErrorLog(scriptName, error.message, null, duration);

          resolve({
            scriptName,
            success: false,
            error: error.message,
            duration,
            httpStatus: null,
            output: stdout,
            stderr
          });
          return;
        }

        const { httpStatus, isApiError, errorMessage } = this.parseCurlOutput(stdout, stderr);

        if (isApiError) {
          const apiErrorMsg = errorMessage || `HTTP ${httpStatus} error`;
          console.error(`❌ ${scriptName}: ${apiErrorMsg}`);

          if (logFile) {
            this.writeLog(logFile, `API ERROR: ${apiErrorMsg}`);
          }

          this.writeReportLog(`❌ API ERROR: ${scriptName} (${duration}ms) - HTTP ${httpStatus}`);
          this.writeErrorLog(scriptName, apiErrorMsg, httpStatus, duration);

          resolve({
            scriptName,
            success: false,
            error: apiErrorMsg,
            duration,
            httpStatus,
            output: stdout,
            stderr
          });
          return;
        }

        const successMsg = `${scriptName} completed successfully in ${duration}ms`;
        console.log(`✅ ${successMsg}`);
        console.log(`⏱️  Duration: ${duration}ms`);

        if (logFile) {
          this.writeLog(logFile, `SUCCESS: ${successMsg}`);
          if (stdout.trim().length > 0) {
            this.writeLog(logFile, `OUTPUT: ${stdout.trim()}`);
          }
        }

        this.writeReportLog(`✅ SUCCESS: ${scriptName} (${duration}ms)`);

        resolve({
          scriptName,
          success: true,
          error: null,
          duration,
          httpStatus,
          output: stdout,
          stderr
        });
      });
    });
  }

  async runAllScripts() {
    const scripts = this.scanScripts();

    if (scripts.length === 0) {
      console.warn('⚠️  No .sh files found to run.');
      console.info(`📁 Checked directory: ${this.scriptsDir}`);
      return [];
    }

    const logFile = this.generateLogFilename();
    console.log(`\n🎯 Running ${scripts.length} script(s)...`);
    console.log(`📝 Logging to: ${logFile}`);

    this.writeLog(logFile, `Starting batch execution of ${scripts.length} scripts`);
    this.writeLog(logFile, `Scripts to run: ${scripts.join(', ')}`);
    this.writeReportLog(`🚀 BATCH START: Running ${scripts.length} scripts`);

    const results = [];

    for (const script of scripts) {
      const result = await this.runScript(script, logFile);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.SCRIPT_DELAY_MS));
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    const summaryMsg = `Batch execution completed: ${successCount} successful, ${failureCount} failed, ${results.length} total`;

    console.log('─'.repeat(50));
    console.log(`📊 Summary:`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${failureCount}`);
    console.log(`  📁 Total: ${results.length}`);

    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 BATCH COMPLETE: ${successCount}/${results.length} successful (${failureCount} failed)`);

    return results;
  }

  async runSpecificScript(scriptName) {
    let normalized = scriptName;
    if (!normalized.endsWith(DEFAULT_CONFIG.SCRIPT_EXTENSION)) {
      normalized += DEFAULT_CONFIG.SCRIPT_EXTENSION;
    }

    const logFile = this.generateLogFilename(normalized);
    this.writeReportLog(`🎯 SINGLE SCRIPT: Starting ${normalized}`);

    return this.runScript(normalized, logFile);
  }

  async runAllScriptsParallel() {
    const scripts = this.scanScripts();

    if (scripts.length === 0) {
      console.warn('⚠️  No .sh files found to run.');
      console.info(`📁 Checked directory: ${this.scriptsDir}`);
      return [];
    }

    const logFile = this.generateLogFilename();
    console.log(`\n🚀 Running ${scripts.length} script(s) in parallel...`);

    this.writeLog(logFile, `Starting parallel execution of ${scripts.length} scripts`);
    this.writeLog(logFile, `Scripts to run: ${scripts.join(', ')}`);
    this.writeReportLog(`🚀 PARALLEL START: Running ${scripts.length} scripts`);

    const startTime = Date.now();
    const results = await Promise.all(scripts.map(script => this.runScript(script, logFile)));
    const totalDuration = Date.now() - startTime;

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    const summaryMsg = `Parallel execution completed: ${successCount} successful, ${failureCount} failed, ${results.length} total in ${totalDuration}ms`;

    console.log('─'.repeat(50));
    console.log(`📊 Parallel Summary:`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${failureCount}`);
    console.log(`  ⏱️ Duration: ${totalDuration}ms`);

    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 PARALLEL COMPLETE: ${successCount}/${results.length} successful (${failureCount} failed) in ${totalDuration}ms`);

    return results;
  }

  async runAllScriptsConcurrent(options = {}) {
    const scripts = this.scanScripts();

    if (scripts.length === 0) {
      console.warn('⚠️  No .sh files found to run.');
      console.info(`📁 Checked directory: ${this.scriptsDir}`);
      return [];
    }

    const batchSize = options.batchSize || DEFAULT_CONFIG.PARALLEL_BATCH_SIZE;
    const delayBetweenBatches = options.delayBetweenBatches ?? DEFAULT_CONFIG.PARALLEL_DELAY_BETWEEN_BATCHES;
    const logFile = this.generateLogFilename();

    this.writeLog(logFile, `Starting concurrent execution of ${scripts.length} scripts in batches of ${batchSize}`);
    this.writeReportLog(`🚀 CONCURRENT START: Running ${scripts.length} scripts in batches of ${batchSize}`);

    const results = [];
    for (let i = 0; i < scripts.length; i += batchSize) {
      const batch = scripts.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(script => this.runScript(script, logFile)));
      results.push(...batchResults);

      if (i + batchSize < scripts.length && delayBetweenBatches > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    const summaryMsg = `Concurrent execution completed: ${successCount} successful, ${failureCount} failed, ${results.length} total`;

    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 CONCURRENT COMPLETE: ${successCount}/${results.length} successful (${failureCount} failed)`);

    return results;
  }

  async runScriptsWithConcurrency(scripts, maxConcurrent = DEFAULT_CONFIG.PARALLEL_MAX_CONCURRENT) {
    if (!Array.isArray(scripts)) {
      throw new Error('Scripts must be an array');
    }

    if (scripts.length === 0) {
      console.warn('No scripts provided to run.');
      return [];
    }

    const logFile = this.generateLogFilename();
    this.writeLog(logFile, `Starting concurrency-controlled execution of ${scripts.length} scripts (max ${maxConcurrent} concurrent)`);

    const results = [];
    for (let i = 0; i < scripts.length; i += maxConcurrent) {
      const batch = scripts.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(batch.map(script => this.runScript(script, logFile)));
      results.push(...batchResults);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    const summaryMsg = `Concurrency-controlled execution completed: ${successCount} successful, ${failureCount} failed, ${results.length} total`;

    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 CONCURRENCY COMPLETE: ${successCount}/${results.length} successful (${failureCount} failed)`);

    return results;
  }

  listScripts() {
    return this.scanScripts();
  }
}