/**
 * @curl-runner/core
 * 
 * Core library for running cURL scripts with comprehensive logging and error handling.
 * This library provides the essential functionality for executing cURL scripts,
 * parsing output, and managing logs without CLI dependencies.
 */

// Enforce Node.js version compatibility on import
import { enforceCompatibility } from './compatibility.js';

// Check compatibility with warning for non-recommended versions
try {
  enforceCompatibility({ strict: false, warn: true });
} catch (error) {
  // Re-throw compatibility errors
  throw error;
}

// Core classes
export { CurlRunner } from './core/CurlRunner.js';
<<<<<<< HEAD
=======
export { WeeklyReporter } from './core/WeeklyReporter.js';
>>>>>>> main

// Utility classes
export { Logger } from './utils/logger.js';
export { CurlParser } from './utils/parser.js';
export { FileSystem } from './utils/fileSystem.js';

// Configuration
export { DEFAULT_CONFIG } from './config/defaults.js';

// Types and interfaces (for TypeScript support)
export * from './types/index.js';

// Compatibility functions
export { 
  enforceCompatibility, 
  getCompatibilityInfo, 
  isTestedVersion, 
  isRecommendedVersion, 
  getCompatibilityMatrix 
} from './compatibility.js';

// Version information
export const VERSION = '1.0.0';
export const LIBRARY_NAME = '@curl-runner/core';