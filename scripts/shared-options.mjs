/**
 * Helpers shared by the lightweight shell-entry scripts.
 */

export function getRunnerOptions(overrides = {}) {
  const options = {
    ...overrides
  };

  if (!options.scriptsDir && process.env.CURL_RUNNER_SCRIPTS_DIR) {
    options.scriptsDir = process.env.CURL_RUNNER_SCRIPTS_DIR;
  }

  if (!options.logsDir && process.env.CURL_RUNNER_LOGS_DIR) {
    options.logsDir = process.env.CURL_RUNNER_LOGS_DIR;
  }

  return options;
}

export function parseInteger(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected a numeric value, but received "${value}"`);
  }
  return parsed;
}

export function exitOnError(error) {
  const message = error?.message ?? String(error);
  console.error(`❌ cURL Runner failed: ${message}`);
  if (error?.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}

