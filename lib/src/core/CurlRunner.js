import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { Logger } from '../utils/logger.js';
import { CurlParser } from '../utils/parser.js';
import { FileSystem } from '../utils/fileSystem.js';
<<<<<<< HEAD
import { DEFAULT_CONFIG } from '../config/defaults.js';

export class CurlRunner {
  constructor(scriptsDir = DEFAULT_CONFIG.SCRIPTS_DIR, logsDir = DEFAULT_CONFIG.LOGS_DIR) {
    this.scriptsDir = scriptsDir;
    this.logsDir = logsDir;
    this.logger = new Logger(logsDir);
=======
import { WeeklyReporter } from './WeeklyReporter.js';
import { DEFAULT_CONFIG } from '../config/defaults.js';

export class CurlRunner {
  constructor(scriptsDir = DEFAULT_CONFIG.SCRIPTS_DIR, logsDir = DEFAULT_CONFIG.LOGS_DIR, reportsDir = DEFAULT_CONFIG.WEEKLY_REPORTING.REPORT_DIR, weeks = DEFAULT_CONFIG.WEEKLY_REPORTING.DEFAULT_WEEKS) {
    this.scriptsDir = scriptsDir;
    this.logsDir = logsDir;
    this.reportsDir = reportsDir;
    this.weeks = weeks;
    this.logger = new Logger(logsDir);
    this.weeklyReporter = new WeeklyReporter(reportsDir, weeks);
>>>>>>> main
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
<<<<<<< HEAD
    console.log(chalk.gray(`📝 Logging to: ${logFile}`));
    console.log(chalk.gray(`📊 Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`));
    console.log(chalk.gray(`🚨 Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`));
=======
    console.log(`[LOG] Logging to: ${logFile}`);
    console.log(`[LOG] Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`);
    console.log(`[LOG] Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`);
>>>>>>> main
    
    this.writeReportLog(`🎯 SINGLE SCRIPT: Starting ${scriptName}`);
    
    const success = await this.runScript(scriptName, logFile);
    
    if (success) {
<<<<<<< HEAD
      console.log(chalk.gray(`📝 Log saved to: ${logFile}`));
      console.log(chalk.gray(`📊 Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`));
      console.log(chalk.gray(`🚨 Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`));
=======
      console.log(`[LOG] Log saved to: ${logFile}`);
      console.log(`[LOG] Report log: ${DEFAULT_CONFIG.REPORT_LOG_FILE}`);
      console.log(`[LOG] Error log: ${DEFAULT_CONFIG.ERROR_LOG_FILE}`);
>>>>>>> main
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
<<<<<<< HEAD
=======

  /**
   * Run weekly data gap analysis and generate reports
   */
  async runWeeklyAnalysis(weekNumber = 1) {
    console.log(`\n[WEEKLY] Starting data gap analysis for week ${weekNumber}/${this.weeks}`);
    console.log(`[REPORTS] Reports directory: ${this.reportsDir}`);
    
    // Run all scripts for this week
    const results = await this.runAllScripts();
    
    // Prepare week data for analysis
    const weekData = {
      week: weekNumber,
      scripts: results.map(result => ({
        name: result.scriptName || 'unknown',
        results: [result]
      }))
    };
    
    // Generate weekly report
    const weeklyReport = this.weeklyReporter.generateWeeklyReport(weekData);
    
    // Save weekly report
    const reportPath = await this.weeklyReporter.saveWeeklyReport(weeklyReport);
    
    // Display summary
    console.log('\n' + '─'.repeat(60));
    console.log('[WEEKLY REPORT SUMMARY]');
    console.log(`  [WEEK] ${weekNumber}/${this.weeks}`);
    console.log(`  [SCRIPTS] ${weeklyReport.summary.totalScripts}`);
    console.log(`  [SUCCESS] ${weeklyReport.summary.successfulScripts}`);
    console.log(`  [FAILED] ${weeklyReport.summary.failedScripts}`);
    console.log(`  [SUCCESS RATE] ${(weeklyReport.summary.overallSuccessRate * 100).toFixed(1)}%`);
    console.log(`  [DATA GAPS] ${weeklyReport.summary.dataGapsCount}`);
    console.log(`  [ALERTS] ${weeklyReport.summary.alertsCount}`);
    console.log(`  [REPORT] ${reportPath}`);
    
    // Display recommendations if any
    if (weeklyReport.recommendations.length > 0) {
      console.log('\n[RECOMMENDATIONS]');
      weeklyReport.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
        console.log(`     Action: ${rec.action}`);
      });
    }
    
    return {
      weekNumber,
      report: weeklyReport,
      reportPath,
      results
    };
  }

  /**
   * Run multi-week analysis and generate summary report
   */
  async runMultiWeekAnalysis() {
    console.log(`\n[MULTI-WEEK] Starting ${this.weeks}-week data gap analysis`);
    console.log(`[REPORTS] Reports directory: ${this.reportsDir}`);
    
    const weeklyReports = [];
    
    for (let week = 1; week <= this.weeks; week++) {
      console.log(`\n[WEEK ${week}/${this.weeks}] Running analysis...`);
      
      try {
        const weekResult = await this.runWeeklyAnalysis(week);
        weeklyReports.push(weekResult.report);
        
        // Add delay between weeks for demonstration
        if (week < this.weeks) {
          console.log(`[WAIT] Waiting before next week...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`[ERROR] Week ${week} analysis failed: ${error.message}`);
        // Continue with next week
      }
    }
    
    // Generate summary report
    if (weeklyReports.length > 0) {
      console.log(`\n[SUMMARY] Generating ${this.weeks}-week summary report...`);
      const summaryReport = this.weeklyReporter.generateSummaryReport(weeklyReports);
      const summaryPath = await this.weeklyReporter.saveSummaryReport(summaryReport);
      
      // Display summary
      console.log('\n' + '═'.repeat(80));
      console.log('[MULTI-WEEK SUMMARY REPORT]');
      console.log(`  [TOTAL WEEKS] ${summaryReport.metadata.totalWeeks}`);
      console.log(`  [TOTAL SCRIPTS] ${summaryReport.overallMetrics.totalScripts}`);
      console.log(`  [SUCCESSFUL] ${summaryReport.overallMetrics.totalSuccessfulScripts}`);
      console.log(`  [FAILED] ${summaryReport.overallMetrics.totalFailedScripts}`);
      console.log(`  [AVERAGE SUCCESS RATE] ${(summaryReport.overallMetrics.averageSuccessRate * 100).toFixed(1)}%`);
      console.log(`  [TOTAL DATA GAPS] ${summaryReport.overallMetrics.totalDataGaps}`);
      console.log(`  [TOTAL ALERTS] ${summaryReport.overallMetrics.totalAlerts}`);
      console.log(`  [SUCCESS TREND] ${summaryReport.trends.successRateTrend}`);
      console.log(`  [SUMMARY REPORT] ${summaryPath}`);
      
      return {
        weeklyReports,
        summaryReport,
        summaryPath
      };
    } else {
      console.log('[WARNING] No weekly reports generated');
      return null;
    }
  }

  /**
   * Get weekly reporting configuration
   */
  getWeeklyReportingConfig() {
    return {
      enabled: DEFAULT_CONFIG.WEEKLY_REPORTING.ENABLED,
      weeks: this.weeks,
      reportsDir: this.reportsDir,
      dataGapAnalysis: DEFAULT_CONFIG.DATA_GAP_ANALYSIS
    };
  }
>>>>>>> main
}