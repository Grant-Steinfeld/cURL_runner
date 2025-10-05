#!/usr/bin/env node

/**
 * cURL Runner - Main Entry Point
 * 
 * This is the main entry point for the cURL runner application.
 * It handles CLI argument parsing and delegates to the appropriate modules.
 */

import { handleCLI } from './src/cli/handler.js';

// Export the main CurlRunner class for programmatic use
export { CurlRunner } from './src/lib/CurlRunner.js';

// Handle CLI execution
handleCLI();