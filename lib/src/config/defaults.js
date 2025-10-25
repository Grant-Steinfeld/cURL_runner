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
  APP_DESCRIPTION: 'Run cURL scripts from .sh files for data gap analysis and reporting',
  
  // Execution settings
  SCRIPT_DELAY_MS: 100,
  TIMEOUT_MS: 30000,
  
  // Parallel execution settings
  PARALLEL_ENABLED: false,
  PARALLEL_BATCH_SIZE: 5,
  PARALLEL_MAX_CONCURRENT: 10,
  PARALLEL_DELAY_BETWEEN_BATCHES: 200,
  // Weekly Reporting Configuration
  WEEKLY_REPORTING: {
    ENABLED: true,
    DEFAULT_WEEKS: 52,
    MIN_WEEKS: 1,
    MAX_WEEKS: 104,
    REPORT_DIR: './var/reports',
    WEEKLY_REPORT_FILE: 'weekly-data-gap-report.json',
    SUMMARY_REPORT_FILE: 'data-gap-summary.json'
  },
  
  // Data Gap Analysis
  DATA_GAP_ANALYSIS: {
    ENABLED: true,
    MISSING_DATA_THRESHOLD: 0.1, // 10% missing data threshold
    ERROR_RATE_THRESHOLD: 0.05,  // 5% error rate threshold
    SUCCESS_RATE_THRESHOLD: 0.95, // 95% success rate threshold
    TREND_ANALYSIS_WEEKS: 4, // Analyze trends over 4 weeks
    ALERT_ON_GAPS: true,
    ALERT_ON_ERRORS: true
  },
  
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
    },
    weeks: {
      short: '-w',
      long: '--weeks',
      description: 'Number of weeks for reporting (default: 52)',
      default: 52,
      type: 'number'
    },
    reports: {
      short: '-r',
      long: '--reports',
      description: 'Reports directory',
      default: './var/reports'
    },
    'data-gap-analysis': {
      short: '-g',
      long: '--data-gap-analysis',
      description: 'Enable data gap analysis',
      default: true,
      type: 'boolean'
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