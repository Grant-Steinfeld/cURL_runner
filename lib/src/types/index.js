/**
 * Type definitions for @curl-runner/core
 * 
 * This file provides JSDoc type definitions for better IDE support
 * and documentation. For full TypeScript support, see the .d.ts files.
 */

/**
 * @typedef {Object} CurlResult
 * @property {boolean} success - Whether the cURL command succeeded
 * @property {string} output - Raw output from the cURL command
 * @property {number} httpStatus - HTTP status code (if available)
 * @property {string} error - Error message (if any)
 * @property {number} duration - Execution time in milliseconds
 * @property {Object} parsed - Parsed output object
 */

/**
 * @typedef {Object} LoggerConfig
 * @property {string} logsDir - Directory for log files
 * @property {string} reportLogFile - Filename for report log
 * @property {string} errorLogFile - Filename for error log
 */

/**
 * @typedef {Object} CurlRunnerConfig
 * @property {string} scriptsDir - Directory containing .sh files
 * @property {string} logsDir - Directory for log files
 * @property {string} reportLogFile - Filename for report log
 * @property {string} errorLogFile - Filename for error log
 * @property {string} scriptExtension - File extension for scripts (.sh)
 * @property {number} scriptDelayMs - Delay between script executions
 */

/**
 * @typedef {Object} ScriptInfo
 * @property {string} name - Script filename
 * @property {string} path - Full path to script
 * @property {string} extension - File extension
 */

/**
 * @typedef {Object} HttpErrorInfo
 * @property {number} status - HTTP status code
 * @property {string} category - Error category (client, server, etc.)
 * @property {boolean} isError - Whether this is an error status
 */

// Export types for use in other modules
export const Types = {
  CurlResult: 'CurlResult',
  LoggerConfig: 'LoggerConfig', 
  CurlRunnerConfig: 'CurlRunnerConfig',
  ScriptInfo: 'ScriptInfo',
  HttpErrorInfo: 'HttpErrorInfo'
};