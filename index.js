#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import chalk from 'chalk';
import { Command } from 'commander';

const program = new Command();

export class CurlRunner {
  constructor(scriptsDir = './scripts', logsDir = './var/logs') {
    this.scriptsDir = scriptsDir;
    this.logsDir = logsDir;
    this.reportLogFile = 'curl-runner-report.log';
    this.errorLogFile = 'curl-api-errors.log';
    this.ensureLogsDirectory();
  }

  /**
   * Ensure logs directory exists
   */
  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Generate log filename with timestamp
   */
  generateLogFilename(scriptName = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    if (scriptName) {
      const cleanScriptName = scriptName.replace('.sh', '').replace(/[^a-zA-Z0-9-_]/g, '_');
      return `${cleanScriptName}_${timestamp}.log`;
    }
    return `run_${timestamp}.log`;
  }

  /**
   * Write log entry to file
   */
  writeLog(logFile, entry) {
    const logPath = path.join(this.logsDir, logFile);
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${entry}\n`;
    
    try {
      fs.appendFileSync(logPath, logEntry);
    } catch (error) {
      console.error(chalk.red(`Error writing to log file: ${error.message}`));
    }
  }

  /**
   * Write high-level report entry
   */
  writeReportLog(entry) {
    const reportPath = path.join(this.logsDir, this.reportLogFile);
    const timestamp = new Date().toISOString();
    const reportEntry = `[${timestamp}] ${entry}\n`;
    
    try {
      fs.appendFileSync(reportPath, reportEntry);
    } catch (error) {
      console.error(chalk.red(`Error writing to report log: ${error.message}`));
    }
  }

  /**
   * Write API error entry to dedicated error log
   */
  writeErrorLog(scriptName, errorDetails, httpStatus = null, duration = null) {
    const errorPath = path.join(this.logsDir, this.errorLogFile);
    const timestamp = new Date().toISOString();
    
    let errorEntry = `[${timestamp}] ❌ API ERROR: ${scriptName}`;
    if (httpStatus) {
      errorEntry += ` (HTTP ${httpStatus})`;
    }
    if (duration) {
      errorEntry += ` (${duration}ms)`;
    }
    errorEntry += `\n`;
    errorEntry += `[${timestamp}] Error: ${errorDetails}\n`;
    errorEntry += `[${timestamp}] ─────────────────────────────────────────\n`;
    
    try {
      fs.appendFileSync(errorPath, errorEntry);
    } catch (error) {
      console.error(chalk.red(`Error writing to error log: ${error.message}`));
    }
  }

  /**
   * Parse cURL output to extract HTTP status and error information
   */
  parseCurlOutput(stdout, stderr) {
    const httpStatusMatch = stdout.match(/HTTP Status: (\d+)/);
    const httpStatus = httpStatusMatch ? parseInt(httpStatusMatch[1]) : null;
    
    // Check for common API error patterns
    const isApiError = httpStatus && (httpStatus >= 400);
    const errorMessage = stderr || (isApiError ? `HTTP ${httpStatus} error` : null);
    
    return { httpStatus, isApiError, errorMessage };
  }

  /**
   * Scan directory for .sh files
   */
  scanScripts() {
    try {
      if (!fs.existsSync(this.scriptsDir)) {
        console.log(chalk.yellow(`Directory ${this.scriptsDir} does not exist. Creating it...`));
        fs.mkdirSync(this.scriptsDir, { recursive: true });
        return [];
      }

      const files = fs.readdirSync(this.scriptsDir);
      const shFiles = files.filter(file => file.endsWith('.sh'));
      
      console.log(chalk.blue(`Found ${shFiles.length} .sh files in ${this.scriptsDir}:`));
      shFiles.forEach((file, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${file}`));
      });
      
      return shFiles;
    } catch (error) {
      console.error(chalk.red(`Error scanning directory: ${error.message}`));
      return [];
    }
  }

  /**
   * Execute a single .sh file
   */
  async runScript(scriptName, logFile = null) {
    const scriptPath = path.join(this.scriptsDir, scriptName);
    
    if (!fs.existsSync(scriptPath)) {
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
    console.log(chalk.gray(`📊 Report log: ${this.reportLogFile}`));
    console.log(chalk.gray(`🚨 Error log: ${this.errorLogFile}`));
    
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
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const summaryMsg = `Batch execution completed: ${successCount} successful, ${failureCount} failed, ${scripts.length} total`;
    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.blue(`📊 Summary:`));
    console.log(chalk.green(`  ✅ Successful: ${successCount}`));
    console.log(chalk.red(`  ❌ Failed: ${failureCount}`));
    console.log(chalk.blue(`  📁 Total: ${scripts.length}`));
    console.log(chalk.gray(`📝 Log saved to: ${logFile}`));
    console.log(chalk.gray(`📊 Report log: ${this.reportLogFile}`));
    console.log(chalk.gray(`🚨 Error log: ${this.errorLogFile}`));
    
    this.writeLog(logFile, summaryMsg);
    this.writeReportLog(`🏁 BATCH COMPLETE: ${successCount}/${scripts.length} successful (${failureCount} failed)`);
  }

  /**
   * Run a specific script by name
   */
  async runSpecificScript(scriptName) {
    if (!scriptName.endsWith('.sh')) {
      scriptName += '.sh';
    }
    
    const logFile = this.generateLogFilename(scriptName);
    console.log(chalk.gray(`📝 Logging to: ${logFile}`));
    console.log(chalk.gray(`📊 Report log: ${this.reportLogFile}`));
    console.log(chalk.gray(`🚨 Error log: ${this.errorLogFile}`));
    
    this.writeReportLog(`🎯 SINGLE SCRIPT: Starting ${scriptName}`);
    
    const success = await this.runScript(scriptName, logFile);
    
    if (success) {
      console.log(chalk.gray(`📝 Log saved to: ${logFile}`));
      console.log(chalk.gray(`📊 Report log: ${this.reportLogFile}`));
      console.log(chalk.gray(`🚨 Error log: ${this.errorLogFile}`));
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

// CLI Setup
program
  .name('curl-runner')
  .description('Run cURL scripts from .sh files')
  .version('1.0.0');

program
  .command('run')
  .description('Run all .sh files in the scripts directory')
  .option('-d, --dir <directory>', 'Scripts directory', './scripts')
  .option('-l, --logs <directory>', 'Logs directory', './var/logs')
  .action(async (options) => {
    const runner = new CurlRunner(options.dir, options.logs);
    await runner.runAllScripts();
  });

program
  .command('run-script <script>')
  .description('Run a specific .sh file')
  .option('-d, --dir <directory>', 'Scripts directory', './scripts')
  .option('-l, --logs <directory>', 'Logs directory', './var/logs')
  .action(async (script, options) => {
    const runner = new CurlRunner(options.dir, options.logs);
    await runner.runSpecificScript(script);
  });

program
  .command('list')
  .description('List all available .sh files')
  .option('-d, --dir <directory>', 'Scripts directory', './scripts')
  .option('-l, --logs <directory>', 'Logs directory', './var/logs')
  .action((options) => {
    const runner = new CurlRunner(options.dir, options.logs);
    runner.listScripts();
  });

// Default action when no command is provided
if (process.argv.length === 2) {
  const runner = new CurlRunner('./scripts', './var/logs');
  runner.runAllScripts();
} else {
  program.parse();
}