import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import chalk from 'chalk';
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
      console.error(chalk.red(errorMsg));
      if (logFile) {
        this.writeLog(logFile, `ERROR: ${errorMsg}`);
      }
      return false;
    }

    console.log(chalk.cyan(`\n🚀 Running script: ${scriptName}`));
    console.log(chalk.gray('─'.repeat(50)));

    if (logFile) {
      this.writeLog(logFile, `Starting execution of script: ${scriptName}`);
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        
        if (error) {
          const errorMsg = `Error executing ${scriptName}: ${error.message}`;
          console.error(chalk.red(`❌ ${errorMsg}`));
          console.error(chalk.red(error.message));
          if (stderr) {
            console.error(chalk.red('STDERR:'), stderr);
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
          
          resolve(false);
          return;
        }

        // Parse cURL output for API errors (HTTP 4xx/5xx)
        const { httpStatus, isApiError, errorMessage } = this.parseCurlOutput(stdout, stderr);
        
        if (isApiError) {
          const errorMsg = `API Error: HTTP ${httpStatus}`;
          console.error(chalk.red(`❌ ${scriptName}: ${errorMsg}`));
          
          if (logFile) {
            this.writeLog(logFile, `API ERROR: ${errorMsg}`);
          }
          
          // Write to report log
          this.writeReportLog(`❌ API ERROR: ${scriptName} (${duration}ms) - HTTP ${httpStatus}`);
          
          // Write to dedicated API error log
          this.writeErrorLog(scriptName, errorMessage || errorMsg, httpStatus, duration);
          
          resolve(false);
          return;
        }

        const successMsg = `${scriptName} completed successfully in ${duration}ms`;
        console.log(chalk.green(`✅ ${successMsg}`));
        console.log(chalk.gray(`⏱️  Duration: ${duration}ms`));
        
        if (logFile) {
          this.writeLog(logFile, `SUCCESS: ${successMsg}`);
        }
        
        // Write to report log
        this.writeReportLog(`✅ SUCCESS: ${scriptName} (${duration}ms)`);
        
        if (stdout) {
          console.log(chalk.blue('\n📤 Output:'));
          console.log(stdout);
          
          if (logFile) {
            this.writeLog(logFile, `OUTPUT: ${stdout.trim()}`);
          }
        }
        
        resolve(true);
      });
    });
  }

  /**
   * Run all .sh files in the directory
   */
  async runAllScripts() {
    const scripts = this.scanScripts();
    
    if (scripts.length === 0) {
      console.log(chalk.yellow('No .sh files found to run.'));
      return;
    }

    const logFile = this.generateLogFilename();
    console.log(chalk.blue(`\n🎯 Running ${scripts.length} script(s)...`));
    console.log(chalk.gray(`📝 Logging to: ${logFile}`));
    console.log(chalk.gray(`📊 Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`));
    console.log(chalk.gray(`🚨 Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`));
    
    this.writeLog(logFile, `Starting batch execution of ${scripts.length} scripts`);
    this.writeLog(logFile, `Scripts to run: ${scripts.join(', ')}`);
    this.writeReportLog(`🚀 BATCH START: Running ${scripts.length} scripts`);
    
    let successCount = 0;
    let failureCount = 0;

    for (const script of scripts) {
      const success = await this.runScript(script, logFile);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Add a small delay between scripts
      await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.SCRIPT_DELAY_MS));
    }

    const summaryMsg = `Batch execution completed: ${successCount} successful, ${failureCount} failed, ${scripts.length} total`;
    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.blue(`📊 Summary:`));
    console.log(chalk.green(`  ✅ Successful: ${successCount}`));
    console.log(chalk.red(`  ❌ Failed: ${failureCount}`));
    console.log(chalk.blue(`  📁 Total: ${scripts.length}`));
    console.log(chalk.gray(`📝 Log saved to: ${logFile}`));
    console.log(chalk.gray(`📊 Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`));
    console.log(chalk.gray(`🚨 Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`));
    
    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 BATCH COMPLETE: ${successCount}/${scripts.length} successful (${failureCount} failed)`);
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
   * List available scripts
   */
  listScripts() {
    const scripts = this.scanScripts();
    return scripts;
  }
}