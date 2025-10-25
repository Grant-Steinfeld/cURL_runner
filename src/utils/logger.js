import fs from 'fs';
import path from 'path';

/**
 * Utility functions for logging operations
 */
export class Logger {
  constructor(logsDir) {
    this.logsDir = logsDir;
    this.reportLogFile = 'curl-runner-report.log';
    this.errorLogFile = 'curl-api-errors.log';
  }

  /**
   * Ensure logs directory exists
   */
  ensureLogsDirectory() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
        console.log(console.log(`✅ Created logs directory: ${this.logsDir}`));
      }
    } catch (error) {
      console.error(console.error(`❌ Failed to create logs directory ${this.logsDir}: ${error.message}`));
      if (error.code === 'EACCES') {
        console.log(console.log(`Permission denied. Please check directory permissions.`));
      }
      throw error;
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
      console.error(console.error(`❌ Error writing to log file ${logFile}: ${error.message}`));
      if (error.code === 'EACCES') {
        console.log(console.log(`Permission denied. Please check file permissions.`));
      } else if (error.code === 'ENOENT') {
        console.log(console.log(`Log directory not found. Attempting to create...`));
        try {
          this.ensureLogsDirectory();
          fs.appendFileSync(logPath, logEntry);
        } catch (retryError) {
          console.error(console.error(`❌ Failed to create log directory: ${retryError.message}`));
        }
      }
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
      console.error(console.error(`❌ Error writing to report log: ${error.message}`));
      if (error.code === 'EACCES') {
        console.log(console.log(`Permission denied. Please check file permissions.`));
      } else if (error.code === 'ENOENT') {
        console.log(console.log(`Log directory not found. Attempting to create...`));
        try {
          this.ensureLogsDirectory();
          fs.appendFileSync(reportPath, reportEntry);
        } catch (retryError) {
          console.error(console.error(`❌ Failed to create log directory: ${retryError.message}`));
        }
      }
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
      console.error(console.error(`❌ Error writing to error log: ${error.message}`));
      if (error.code === 'EACCES') {
        console.log(console.log(`Permission denied. Please check file permissions.`));
      } else if (error.code === 'ENOENT') {
        console.log(console.log(`Log directory not found. Attempting to create...`));
        try {
          this.ensureLogsDirectory();
          fs.appendFileSync(errorPath, errorEntry);
        } catch (retryError) {
          console.error(console.error(`❌ Failed to create log directory: ${retryError.message}`));
        }
      }
    }
  }
}