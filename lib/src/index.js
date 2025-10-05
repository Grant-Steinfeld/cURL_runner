/**
 * @curl-runner/core
 * 
 * Core library for running cURL scripts with comprehensive logging and error handling.
 * This library provides the essential functionality for executing cURL scripts,
 * parsing output, and managing logs without CLI dependencies.
 */

// Core classes
export { CurlRunner } from './core/CurlRunner.js';

// Utility classes
export { Logger } from './utils/logger.js';
export { CurlParser } from './utils/parser.js';
export { FileSystem } from './utils/fileSystem.js';

// Configuration
export { DEFAULT_CONFIG } from './config/defaults.js';

// Types and interfaces (for TypeScript support)
export * from './types/index.js';

// Version information
export const VERSION = '1.0.0';
export const LIBRARY_NAME = '@curl-runner/core';