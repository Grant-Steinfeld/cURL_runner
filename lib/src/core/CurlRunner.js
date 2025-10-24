import fs from 'fs';
import path from 'path';
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

  /**
   * Ensure logs directory exists
   */
  ensureLogsDirectory() {
    this.logger.ensureLogsDirectory();
  }

  /**
   * Generate log filename with timestamp
   */
  generateLogFilename(scriptName = null) {
    return this.logger.generateLogFilename(scriptName);
  }

  /**
   * Write log entry to file
   */
  writeLog(logFile, entry) {
    this.logger.writeLog(logFile, entry);
  }

  /**
   * Write high-level report entry
   */
  writeReportLog(entry) {
    this.logger.writeReportLog(entry);
  }

  /**
   * Write API error entry to dedicated error log
   */
  writeErrorLog(scriptName, errorDetails, httpStatus = null, duration = null) {
    this.logger.writeErrorLog(scriptName, errorDetails, httpStatus, duration);
  }

  /**
   * Parse cURL output to extract HTTP status and error information
   */
  parseCurlOutput(stdout, stderr) {
    return CurlParser.parseCurlOutput(stdout, stderr);
  }

  /**
   * Scan directory for .sh files
   */
  scanScripts() {
    return FileSystem.scanScripts(this.scriptsDir);
  }

  /**
   * Execute a single .sh file
   */
  async runScript(scriptName, logFile = null) {
    const scriptPath = FileSystem.joinPath(this.scriptsDir, scriptName);
    
    if (!FileSystem.fileExists(scriptPath)) {
      const errorMsg = `Script ${scriptName} not found in ${this.scriptsDir}`;
      console.error(`[ERROR] ${errorMsg}`);
      if (logFile) {
        this.writeLog(logFile, `ERROR: ${errorMsg}`);
      }
      return {
        success: false,
        output: '',
        httpStatus: null,
        error: errorMsg,
        duration: 0,
        parsed: { httpStatus: null, isApiError: false, errorMessage: errorMsg }
      };
    }

    console.log(`\n[RUNNING] ${scriptName}`);
    console.log('─'.repeat(50));

    if (logFile) {
      this.writeLog(logFile, `Starting execution of script: ${scriptName}`);
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        
        if (error) {
          const errorMsg = `Error executing ${scriptName}: ${error.message}`;
          console.error(`[FAILED] ${errorMsg}`);
          console.error(`[ERROR] ${error.message}`);
          if (stderr) {
            console.error('[STDERR]', stderr);
          }
          
          if (logFile) {
            this.writeLog(logFile, `ERROR: ${errorMsg}`);
            if (stderr) {
              this.writeLog(logFile, `STDERR: ${stderr}`);
            }
          }
          
          // Write to report log
          this.writeReportLog(`❌ FAILED: ${scriptName} (${duration}ms) - ${error.message}`);
          
          // Write to API error log for execution errors
          this.writeErrorLog(scriptName, error.message, null, duration);
          
          resolve({
            success: false,
            output: stdout || '',
            httpStatus: null,
            error: error.message,
            duration: duration,
            parsed: { httpStatus: null, isApiError: false, errorMessage: error.message }
          });
          return;
        }

        // Parse cURL output for API errors (HTTP 4xx/5xx)
        const { httpStatus, isApiError, errorMessage } = this.parseCurlOutput(stdout, stderr);
        
        if (isApiError) {
          const errorMsg = `API Error: HTTP ${httpStatus}`;
          console.error(`[API_ERROR] ${scriptName}: ${errorMsg}`);
          
          if (logFile) {
            this.writeLog(logFile, `API ERROR: ${errorMsg}`);
          }
          
          // Write to report log
          this.writeReportLog(`❌ API ERROR: ${scriptName} (${duration}ms) - HTTP ${httpStatus}`);
          
          // Write to dedicated API error log
          this.writeErrorLog(scriptName, errorMessage || errorMsg, httpStatus, duration);
          
          resolve({
            success: false,
            output: stdout || '',
            httpStatus: httpStatus,
            error: errorMessage || errorMsg,
            duration: duration,
            parsed: { httpStatus, isApiError, errorMessage: errorMessage || errorMsg }
          });
          return;
        }

        const successMsg = `${scriptName} completed successfully in ${duration}ms`;
        console.log(`[SUCCESS] ${successMsg}`);
        console.log(`[DURATION] ${duration}ms`);
        
        if (logFile) {
          this.writeLog(logFile, `SUCCESS: ${successMsg}`);
        }
        
        // Write to report log
        this.writeReportLog(`✅ SUCCESS: ${scriptName} (${duration}ms)`);
        
        if (stdout) {
          console.log('\n[OUTPUT]');
          console.log(stdout);
          
          if (logFile) {
            this.writeLog(logFile, `OUTPUT: ${stdout.trim()}`);
          }
        }
        
        resolve({
          success: true,
          output: stdout,
          httpStatus: httpStatus,
          error: null,
          duration: duration,
          parsed: { httpStatus, isApiError, errorMessage }
        });
      });
    });
  }

  /**
   * Run all .sh files in the directory
   */
  async runAllScripts() {
    const scripts = this.scanScripts();
    
    if (scripts.length === 0) {
      console.log('[WARNING] No .sh files found to run.');
      return [];
    }

    const logFile = this.generateLogFilename();
    console.log(`\n[BATCH] Running ${scripts.length} script(s)...`);
    console.log(`[LOG] Logging to: ${logFile}`);
    console.log(`[LOG] Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`);
    console.log(`[LOG] Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`);
    
    this.writeLog(logFile, `Starting batch execution of ${scripts.length} scripts`);
    this.writeLog(logFile, `Scripts to run: ${scripts.join(', ')}`);
    this.writeReportLog(`🚀 BATCH START: Running ${scripts.length} scripts`);
    
    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const script of scripts) {
      const result = await this.runScript(script, logFile);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Add a small delay between scripts
      await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.SCRIPT_DELAY_MS));
    }

    const summaryMsg = `Batch execution completed: ${successCount} successful, ${failureCount} failed, ${scripts.length} total`;
    console.log('\n' + '─'.repeat(50));
    console.log('[SUMMARY]');
    console.log(`  [SUCCESS] ${successCount}`);
    console.log(`  [FAILED] ${failureCount}`);
    console.log(`  [TOTAL] ${scripts.length}`);
    console.log(`[LOG] Log saved to: ${logFile}`);
    console.log(`[LOG] Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`);
    console.log(`[LOG] Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`);
    
    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 BATCH COMPLETE: ${successCount}/${scripts.length} successful (${failureCount} failed)`);
    
    return results;
  }

  /**
   * Run a specific script by name
   */
  async runSpecificScript(scriptName) {
    if (!scriptName.endsWith(DEFAULT_CONFIG.SCRIPT_EXTENSION)) {
      scriptName += DEFAULT_CONFIG.SCRIPT_EXTENSION;
    }
    
    const logFile = this.generateLogFilename(scriptName);
    console.log(chalk.gray(`📝 Logging to: ${logFile}`));
    console.log(chalk.gray(`📊 Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`));
    console.log(chalk.gray(`🚨 Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`));
    
    this.writeReportLog(`🎯 SINGLE SCRIPT: Starting ${scriptName}`);
    
    const success = await this.runScript(scriptName, logFile);
    
    if (success) {
      console.log(chalk.gray(`📝 Log saved to: ${logFile}`));
      console.log(chalk.gray(`📊 Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`));
      console.log(chalk.gray(`🚨 Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`));
    }
    
    return success;
  }

  /**
   * Run all scripts in parallel (unlimited concurrency)
   */
  async runAllScriptsParallel() {
    const scripts = this.scanScripts();
    
    if (scripts.length === 0) {
      console.log('[WARNING] No .sh files found to run.');
      return [];
    }

    const logFile = this.generateLogFilename();
    console.log(`\n[PARALLEL] Running ${scripts.length} script(s) in parallel...`);
    console.log(`[LOG] Logging to: ${logFile}`);
    console.log(`[LOG] Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`);
    console.log(`[LOG] Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`);
    
    this.writeLog(logFile, `Starting parallel execution of ${scripts.length} scripts`);
    this.writeLog(logFile, `Scripts to run: ${scripts.join(', ')}`);
    this.writeReportLog(`🚀 PARALLEL START: Running ${scripts.length} scripts`);
    
    const startTime = Date.now();
    
    // Run all scripts in parallel
    const results = await Promise.all(
      scripts.map(script => this.runScript(script, logFile))
    );
    
    const totalDuration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    const summaryMsg = `Parallel execution completed: ${successCount} successful, ${failureCount} failed, ${scripts.length} total in ${totalDuration}ms`;
    console.log('\n' + '─'.repeat(50));
    console.log('[PARALLEL SUMMARY]');
    console.log(`  [SUCCESS] ${successCount}`);
    console.log(`  [FAILED] ${failureCount}`);
    console.log(`  [TOTAL] ${scripts.length}`);
    console.log(`  [DURATION] ${totalDuration}ms`);
    console.log(`[LOG] Log saved to: ${logFile}`);
    console.log(`[LOG] Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`);
    console.log(`[LOG] Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`);
    
    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 PARALLEL COMPLETE: ${successCount}/${scripts.length} successful (${failureCount} failed) in ${totalDuration}ms`);
    
    return results;
  }

  /**
   * Run all scripts with controlled concurrency (batched parallel execution)
   */
  async runAllScriptsConcurrent(options = {}) {
    const scripts = this.scanScripts();
    
    if (scripts.length === 0) {
      console.log('[WARNING] No .sh files found to run.');
      return [];
    }

    const batchSize = options.batchSize || DEFAULT_CONFIG.PARALLEL_BATCH_SIZE;
    const delayBetweenBatches = options.delayBetweenBatches || DEFAULT_CONFIG.PARALLEL_DELAY_BETWEEN_BATCHES;
    
    const logFile = this.generateLogFilename();
    console.log(`\n[CONCURRENT] Running ${scripts.length} script(s) in batches of ${batchSize}...`);
    console.log(`[LOG] Logging to: ${logFile}`);
    console.log(`[LOG] Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`);
    console.log(`[LOG] Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`);
    
    this.writeLog(logFile, `Starting concurrent execution of ${scripts.length} scripts in batches of ${batchSize}`);
    this.writeLog(logFile, `Scripts to run: ${scripts.join(', ')}`);
    this.writeReportLog(`🚀 CONCURRENT START: Running ${scripts.length} scripts in batches of ${batchSize}`);
    
    const startTime = Date.now();
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Process scripts in batches
    for (let i = 0; i < scripts.length; i += batchSize) {
      const batch = scripts.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(scripts.length / batchSize);
      
      console.log(`\n[BATCH ${batchNumber}/${totalBatches}] Running ${batch.length} scripts...`);
      this.writeLog(logFile, `Starting batch ${batchNumber}/${totalBatches} with scripts: ${batch.join(', ')}`);
      
      const batchStartTime = Date.now();
      const batchResults = await Promise.all(
        batch.map(script => this.runScript(script, logFile))
      );
      const batchDuration = Date.now() - batchStartTime;
      
      results.push(...batchResults);
      
      const batchSuccessCount = batchResults.filter(r => r.success).length;
      const batchFailureCount = batchResults.filter(r => !r.success).length;
      successCount += batchSuccessCount;
      failureCount += batchFailureCount;
      
      console.log(`[BATCH ${batchNumber} COMPLETE] ${batchSuccessCount} successful, ${batchFailureCount} failed in ${batchDuration}ms`);
      this.writeLog(logFile, `Batch ${batchNumber} completed: ${batchSuccessCount} successful, ${batchFailureCount} failed in ${batchDuration}ms`);
      
      // Add delay between batches (except for the last batch)
      if (i + batchSize < scripts.length && delayBetweenBatches > 0) {
        console.log(`[DELAY] Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    const totalDuration = Date.now() - startTime;
    const summaryMsg = `Concurrent execution completed: ${successCount} successful, ${failureCount} failed, ${scripts.length} total in ${totalDuration}ms`;
    console.log('\n' + '─'.repeat(50));
    console.log('[CONCURRENT SUMMARY]');
    console.log(`  [SUCCESS] ${successCount}`);
    console.log(`  [FAILED] ${failureCount}`);
    console.log(`  [TOTAL] ${scripts.length}`);
    console.log(`  [DURATION] ${totalDuration}ms`);
    console.log(`  [BATCHES] ${Math.ceil(scripts.length / batchSize)}`);
    console.log(`[LOG] Log saved to: ${logFile}`);
    console.log(`[LOG] Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`);
    console.log(`[LOG] Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`);
    
    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 CONCURRENT COMPLETE: ${successCount}/${scripts.length} successful (${failureCount} failed) in ${totalDuration}ms across ${Math.ceil(scripts.length / batchSize)} batches`);
    
    return results;
  }

  /**
   * Run scripts with custom concurrency control
   */
  async runScriptsWithConcurrency(scripts, maxConcurrent = DEFAULT_CONFIG.PARALLEL_MAX_CONCURRENT) {
    if (!Array.isArray(scripts)) {
      throw new Error('Scripts must be an array');
    }
    
    if (scripts.length === 0) {
      console.log('[WARNING] No scripts provided to run.');
      return [];
    }

    const logFile = this.generateLogFilename();
    console.log(`\n[CONCURRENCY] Running ${scripts.length} script(s) with max ${maxConcurrent} concurrent...`);
    console.log(`[LOG] Logging to: ${logFile}`);
    
    this.writeLog(logFile, `Starting concurrency-controlled execution of ${scripts.length} scripts (max ${maxConcurrent} concurrent)`);
    this.writeLog(logFile, `Scripts to run: ${scripts.join(', ')}`);
    this.writeReportLog(`🚀 CONCURRENCY START: Running ${scripts.length} scripts (max ${maxConcurrent} concurrent)`);
    
    const startTime = Date.now();
    const results = [];
    
    // Process scripts with concurrency control
    for (let i = 0; i < scripts.length; i += maxConcurrent) {
      const batch = scripts.slice(i, i + maxConcurrent);
      const batchNumber = Math.floor(i / maxConcurrent) + 1;
      const totalBatches = Math.ceil(scripts.length / maxConcurrent);
      
      console.log(`\n[CONCURRENT BATCH ${batchNumber}/${totalBatches}] Running ${batch.length} scripts...`);
      this.writeLog(logFile, `Starting concurrent batch ${batchNumber}/${totalBatches} with scripts: ${batch.join(', ')}`);
      
      const batchResults = await Promise.all(
        batch.map(script => this.runScript(script, logFile))
      );
      
      results.push(...batchResults);
      
      const batchSuccessCount = batchResults.filter(r => r.success).length;
      const batchFailureCount = batchResults.filter(r => !r.success).length;
      
      console.log(`[BATCH ${batchNumber} COMPLETE] ${batchSuccessCount} successful, ${batchFailureCount} failed`);
      this.writeLog(logFile, `Concurrent batch ${batchNumber} completed: ${batchSuccessCount} successful, ${batchFailureCount} failed`);
    }
    
    const totalDuration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    const summaryMsg = `Concurrency-controlled execution completed: ${successCount} successful, ${failureCount} failed, ${scripts.length} total in ${totalDuration}ms`;
    console.log('\n' + '─'.repeat(50));
    console.log('[CONCURRENCY SUMMARY]');
    console.log(`  [SUCCESS] ${successCount}`);
    console.log(`  [FAILED] ${failureCount}`);
    console.log(`  [TOTAL] ${scripts.length}`);
    console.log(`  [DURATION] ${totalDuration}ms`);
    console.log(`  [MAX CONCURRENT] ${maxConcurrent}`);
    
    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 CONCURRENCY COMPLETE: ${successCount}/${scripts.length} successful (${failureCount} failed) in ${totalDuration}ms`);
    
    return results;
  }

  /**
   * List available scripts
   */
  listScripts() {
    const scripts = this.scanScripts();
    return scripts;
  }
}