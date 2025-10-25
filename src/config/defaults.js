/**
 * Default configuration values for the cURL runner
 */
export const DEFAULT_CONFIG = {
  // Directory paths
  SCRIPTS_DIR: './cURL_scripts',
  LOGS_DIR: './var/logs',
  
  // Log file names
  REPORT_LOG_FILE: 'curl-runner-report.log',
  ERROR_LOG_FILE: 'curl-api-errors.log',
  
  // Application settings
  APP_NAME: 'curl-runner',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Run cURL scripts from .sh files',
  
  // Execution settings
  SCRIPT_DELAY_MS: 100,
  TIMEOUT_MS: 30000,
  
  // Parallel execution settings
  PARALLEL_ENABLED: false,
  PARALLEL_BATCH_SIZE: 5,
  PARALLEL_MAX_CONCURRENT: 10,
  PARALLEL_DELAY_BETWEEN_BATCHES: 200,
  
  // HTTP status codes
  HTTP_SUCCESS_MIN: 200,
  HTTP_SUCCESS_MAX: 299,
  HTTP_CLIENT_ERROR_MIN: 400,
  HTTP_CLIENT_ERROR_MAX: 499,
  HTTP_SERVER_ERROR_MIN: 500,
  HTTP_SERVER_ERROR_MAX: 599,
  
  // File patterns
  SCRIPT_EXTENSION: '.sh',
  
  // Logging
  LOG_TIMESTAMP_FORMAT: 'ISO',
  LOG_ENTRY_PREFIX: '[{timestamp}]',
  
  // CLI options
  CLI_OPTIONS: {
    dir: {
      short: '-d',
      long: '--dir',
      description: 'Scripts directory',
      default: './cURL_scripts'
    },
    logs: {
      short: '-l',
      long: '--logs',
      description: 'Logs directory',
      default: './var/logs'
    }
  }
};

/**
 * Get configuration value with fallback to default
 */
export function getConfig(key, fallback = null) {
  const keys = key.split('.');
  let value = DEFAULT_CONFIG;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback;
    }
  }
  
  return value;
}

/**
 * Merge user configuration with defaults
 */
export function mergeConfig(userConfig = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig
  };
}