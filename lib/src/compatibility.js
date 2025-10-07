/**
 * Node.js Version Compatibility Enforcer
 * 
 * This module enforces Node.js version compatibility when the library is first loaded.
 * It checks the current Node.js version against the required range and provides
 * clear error messages for incompatible versions.
 */

/**
 * Version compatibility configuration
 */
const COMPATIBILITY_CONFIG = {
  // Minimum required Node.js version
  MIN_VERSION: '18.0.0',
  
  // Recommended version range for optimal performance
  RECOMMENDED_MIN: '22.0.0',
  RECOMMENDED_MAX: '24.9.9',
  
  // Tested version range
  TESTED_MIN: '22.0.0',
  TESTED_MAX: '24.9.9',
  
  // Library name for error messages
  LIBRARY_NAME: '@curl-runner/core',
  
  // Error messages
  MESSAGES: {
    UNSUPPORTED_VERSION: 'Unsupported Node.js version',
    RECOMMENDED_VERSION: 'Recommended Node.js version',
    TESTED_VERSION: 'Tested Node.js version',
    MINIMUM_VERSION: 'Minimum Node.js version'
  }
};

/**
 * Parse Node.js version string into comparable parts
 * @param {string} version - Node.js version string (e.g., "v22.18.0")
 * @returns {Object} Parsed version object
 */
function parseVersion(version) {
  // Remove 'v' prefix and split by dots
  const parts = version.replace(/^v/, '').split('.').map(Number);
  
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
    original: version
  };
}

/**
 * Compare two version objects
 * @param {Object} version1 - First version object
 * @param {Object} version2 - Second version object
 * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
function compareVersions(version1, version2) {
  if (version1.major !== version2.major) {
    return version1.major - version2.major;
  }
  if (version1.minor !== version2.minor) {
    return version1.minor - version2.minor;
  }
  return version1.patch - version2.patch;
}

/**
 * Check if a version is within a range
 * @param {Object} version - Version to check
 * @param {string} minVersion - Minimum version string
 * @param {string} maxVersion - Maximum version string
 * @returns {Object} Compatibility result
 */
function checkVersionRange(version, minVersion, maxVersion) {
  const min = parseVersion(minVersion);
  const max = parseVersion(maxVersion);
  
  const isMinCompatible = compareVersions(version, min) >= 0;
  const isMaxCompatible = compareVersions(version, max) <= 0;
  
  return {
    isCompatible: isMinCompatible && isMaxCompatible,
    isMinCompatible,
    isMaxCompatible,
    minVersion,
    maxVersion
  };
}

/**
 * Get compatibility status for current Node.js version
 * @returns {Object} Compatibility status
 */
function getCompatibilityStatus() {
  const currentVersion = parseVersion(process.version);
  const minVersion = COMPATIBILITY_CONFIG.MIN_VERSION;
  const recommendedMin = COMPATIBILITY_CONFIG.RECOMMENDED_MIN;
  const recommendedMax = COMPATIBILITY_CONFIG.RECOMMENDED_MAX;
  const testedMin = COMPATIBILITY_CONFIG.TESTED_MIN;
  const testedMax = COMPATIBILITY_CONFIG.TESTED_MAX;
  
  // Check minimum compatibility
  const minCompatibility = checkVersionRange(currentVersion, minVersion, '999.999.999');
  
  // Check recommended range
  const recommendedCompatibility = checkVersionRange(currentVersion, recommendedMin, recommendedMax);
  
  // Check tested range
  const testedCompatibility = checkVersionRange(currentVersion, testedMin, testedMax);
  
  return {
    currentVersion: currentVersion.original,
    minCompatibility,
    recommendedCompatibility,
    testedCompatibility,
    isSupported: minCompatibility.isCompatible,
    isRecommended: recommendedCompatibility.isCompatible,
    isTested: testedCompatibility.isCompatible
  };
}

/**
 * Generate compatibility error message
 * @param {Object} status - Compatibility status
 * @returns {string} Error message
 */
function generateErrorMessage(status) {
  const { currentVersion, minCompatibility, recommendedCompatibility, testedCompatibility } = status;
  const libName = COMPATIBILITY_CONFIG.LIBRARY_NAME;
  
  let message = `\n❌ ${COMPATIBILITY_CONFIG.MESSAGES.UNSUPPORTED_VERSION}\n\n`;
  message += `📦 Library: ${libName}\n`;
  message += `🔧 Current Node.js: ${currentVersion}\n`;
  message += `📋 Required: >=${minCompatibility.minVersion}\n\n`;
  
  if (!minCompatibility.isCompatible) {
    message += `❌ Your Node.js version (${currentVersion}) is below the minimum required version (${minCompatibility.minVersion}).\n`;
    message += `   Please upgrade Node.js to continue using ${libName}.\n\n`;
  }
  
  if (minCompatibility.isCompatible && !recommendedCompatibility.isCompatible) {
    message += `⚠️  Your Node.js version (${currentVersion}) is supported but not recommended.\n`;
    message += `   Recommended range: ${recommendedCompatibility.minVersion} - ${recommendedCompatibility.maxVersion}\n`;
    message += `   For best performance and security, consider upgrading.\n\n`;
  }
  
  if (minCompatibility.isCompatible && recommendedCompatibility.isCompatible && !testedCompatibility.isCompatible) {
    message += `⚠️  Your Node.js version (${currentVersion}) is supported but not fully tested.\n`;
    message += `   Tested range: ${testedCompatibility.minVersion} - ${testedCompatibility.maxVersion}\n`;
    message += `   The library should work, but some features may not be optimized.\n\n`;
  }
  
  message += `🔗 For more information, visit: https://github.com/Grant-Steinfeld/cURL_runner\n`;
  message += `📚 Compatibility guide: https://github.com/Grant-Steinfeld/cURL_runner/blob/main/lib/VERSION_COMPATIBILITY.md\n`;
  
  return message;
}

/**
 * Generate compatibility warning message
 * @param {Object} status - Compatibility status
 * @returns {string} Warning message
 */
function generateWarningMessage(status) {
  const { currentVersion, recommendedCompatibility, testedCompatibility } = status;
  const libName = COMPATIBILITY_CONFIG.LIBRARY_NAME;
  
  let message = `\n⚠️  ${COMPATIBILITY_CONFIG.MESSAGES.RECOMMENDED_VERSION}\n\n`;
  message += `📦 Library: ${libName}\n`;
  message += `🔧 Current Node.js: ${currentVersion}\n\n`;
  
  if (!recommendedCompatibility.isCompatible) {
    message += `📋 Recommended range: ${recommendedCompatibility.minVersion} - ${recommendedCompatibility.maxVersion}\n`;
    message += `   For optimal performance and security, consider upgrading.\n\n`;
  }
  
  if (!testedCompatibility.isCompatible) {
    message += `🧪 Tested range: ${testedCompatibility.minVersion} - ${testedCompatibility.maxVersion}\n`;
    message += `   The library should work, but some features may not be optimized.\n\n`;
  }
  
  message += `🔗 Compatibility guide: https://github.com/Grant-Steinfeld/cURL_runner/blob/main/lib/VERSION_COMPATIBILITY.md\n`;
  
  return message;
}

/**
 * Enforce Node.js version compatibility
 * @param {Object} options - Enforcement options
 * @param {boolean} options.strict - Whether to throw error for non-recommended versions
 * @param {boolean} options.warn - Whether to show warnings for non-tested versions
 * @throws {Error} If version is incompatible
 */
export function enforceCompatibility(options = {}) {
  const { strict = false, warn = true } = options;
  
  const status = getCompatibilityStatus();
  
  // Check if version is supported at all
  if (!status.isSupported) {
    const errorMessage = generateErrorMessage(status);
    throw new Error(errorMessage);
  }
  
  // Check if we should warn about non-recommended versions
  if (warn && !status.isRecommended) {
    const warningMessage = generateWarningMessage(status);
    console.warn(warningMessage);
  }
  
  // Check if we should be strict about non-tested versions
  if (strict && !status.isTested) {
    const errorMessage = generateErrorMessage(status);
    throw new Error(errorMessage);
  }
  
  return status;
}

/**
 * Get compatibility information without enforcement
 * @returns {Object} Compatibility information
 */
export function getCompatibilityInfo() {
  return getCompatibilityStatus();
}

/**
 * Check if current version is in tested range
 * @returns {boolean} True if in tested range
 */
export function isTestedVersion() {
  const status = getCompatibilityStatus();
  return status.isTested;
}

/**
 * Check if current version is in recommended range
 * @returns {boolean} True if in recommended range
 */
export function isRecommendedVersion() {
  const status = getCompatibilityStatus();
  return status.isRecommended;
}

/**
 * Get version compatibility matrix
 * @returns {Object} Compatibility matrix
 */
export function getCompatibilityMatrix() {
  const status = getCompatibilityStatus();
  
  return {
    current: status.currentVersion,
    minimum: COMPATIBILITY_CONFIG.MIN_VERSION,
    recommended: {
      min: COMPATIBILITY_CONFIG.RECOMMENDED_MIN,
      max: COMPATIBILITY_CONFIG.RECOMMENDED_MAX
    },
    tested: {
      min: COMPATIBILITY_CONFIG.TESTED_MIN,
      max: COMPATIBILITY_CONFIG.TESTED_MAX
    },
    status: {
      isSupported: status.isSupported,
      isRecommended: status.isRecommended,
      isTested: status.isTested
    }
  };
}