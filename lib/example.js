#!/usr/bin/env node

/**
 * Example usage of @curl-runner/core library
 * 
 * This demonstrates how to use the core library without the CLI
 */

import { CurlRunner, Logger, CurlParser, FileSystem, DEFAULT_CONFIG } from './src/index.js';

async function demonstrateLibrary() {
  console.log('🚀 @curl-runner/core Library Demo\n');

  // 1. Show configuration
  console.log('📋 Default Configuration:');
  console.log(`   Scripts Directory: ${DEFAULT_CONFIG.SCRIPTS_DIR}`);
  console.log(`   Logs Directory: ${DEFAULT_CONFIG.LOGS_DIR}`);
  console.log(`   Script Extension: ${DEFAULT_CONFIG.SCRIPT_EXTENSION}`);
  console.log(`   Script Delay: ${DEFAULT_CONFIG.SCRIPT_DELAY_MS}ms\n`);

  // 2. Demonstrate CurlRunner
  console.log('🔄 CurlRunner Demo:');
  const runner = new CurlRunner('./scripts', './example-logs');

  // Scan for scripts
  const scripts = await runner.scanScripts();
  console.log(`   Found ${scripts.length} scripts\n`);

  // 3. Demonstrate Logger
  console.log('📝 Logger Demo:');
  const logger = new Logger('./example-logs');
  await logger.writeReportLog('Library demo started');
  await logger.writeErrorLog('This is a demo error log entry');
  console.log('   Logs written to ./example-logs/\n');

  // 4. Demonstrate CurlParser
  console.log('🔍 CurlParser Demo:');
  const sampleOutput = 'HTTP Status: 200\n{"message": "success", "data": {"id": 123}}';
  const parsed = CurlParser.parseCurlOutput(sampleOutput);
  console.log(`   Parsed HTTP Status: ${parsed.httpStatus}`);
  console.log(`   Is API Error: ${parsed.isApiError}`);
  console.log(`   Error Message: ${parsed.errorMessage || 'None'}\n`);

  // 5. Demonstrate FileSystem
  console.log('📁 FileSystem Demo:');
  const fileExists = FileSystem.fileExists('./package.json');
  console.log(`   package.json exists: ${fileExists}`);
  
  const extension = FileSystem.getFileExtension('example.sh');
  console.log(`   File extension for 'example.sh': ${extension}`);
  
  const joinedPath = FileSystem.joinPath('./scripts', 'test.sh');
  console.log(`   Joined path: ${joinedPath}\n`);

  // 6. Show version info
  console.log('ℹ️  Library Information:');
  console.log(`   Library Name: @curl-runner/core`);
  console.log(`   Version: 1.0.0`);
  console.log(`   Node.js Required: >=18.0.0\n`);

  console.log('✅ Demo completed successfully!');
}

// Run the demo
demonstrateLibrary().catch(console.error);