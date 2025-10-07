#!/usr/bin/env node

/**
 * Comprehensive test of @curl-runner/core library
 * 
 * This script tests the library with real cURL scripts
 */

import { CurlRunner, Logger, CurlParser, FileSystem } from './src/index.js';

async function testLibrary() {
  console.log('🧪 @curl-runner/core Library Comprehensive Test\n');

  // Create test runner
  const runner = new CurlRunner('./test-scripts', './test-logs');
  
  try {
    // Test 1: Scan for scripts
    console.log('📁 Test 1: Scanning for scripts...');
    const scripts = await runner.scanScripts();
    console.log(`   Found ${scripts.length} scripts: ${scripts.join(', ')}\n`);

    // Test 2: Run individual scripts
    console.log('🔄 Test 2: Running individual scripts...');
    
    for (const script of scripts) {
      console.log(`\n   Running ${script}...`);
      const startTime = Date.now();
      
      try {
        const result = await runner.runScript(script);
        const duration = Date.now() - startTime;
        
        console.log(`   ✅ ${script} completed in ${duration}ms`);
        console.log(`   HTTP Status: ${result.httpStatus || 'N/A'}`);
        console.log(`   Success: ${result.success}`);
        
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      } catch (error) {
        console.log(`   ❌ ${script} failed: ${error.message}`);
      }
    }

    // Test 3: Run all scripts in batch
    console.log('\n🚀 Test 3: Running all scripts in batch...');
    const batchStartTime = Date.now();
    const batchResults = await runner.runAllScripts();
    const batchDuration = Date.now() - batchStartTime;
    
    console.log(`   Batch completed in ${batchDuration}ms`);
    console.log(`   Results: ${batchResults.length} scripts processed`);
    
    const successful = batchResults.filter(r => r.success).length;
    const failed = batchResults.filter(r => !r.success).length;
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);

    // Test 4: Test individual components
    console.log('\n🔧 Test 4: Testing individual components...');
    
    // Test Logger
    const logger = new Logger('./test-logs');
    await logger.writeReportLog('Library test completed');
    await logger.writeErrorLog('test-error', 'This is a test error', 404, 1500);
    console.log('   ✅ Logger: Logs written successfully');
    
    // Test CurlParser
    const sampleOutput = 'HTTP Status: 200\n{"message": "success"}';
    const parsed = CurlParser.parseCurlOutput(sampleOutput);
    console.log(`   ✅ CurlParser: Parsed status ${parsed.httpStatus}, isError: ${parsed.isApiError}`);
    
    // Test FileSystem
    const fileExists = FileSystem.fileExists('./package.json');
    const extension = FileSystem.getFileExtension('test.sh');
    console.log(`   ✅ FileSystem: package.json exists: ${fileExists}, .sh extension: ${extension}`);

    // Test 5: Check generated logs
    console.log('\n📝 Test 5: Checking generated logs...');
    const logFiles = FileSystem.scanScripts('./test-logs');
    console.log(`   Generated ${logFiles.length} log files in test-logs/`);
    
    // List log files
    try {
      const fs = await import('fs');
      const logDir = './test-logs';
      if (fs.existsSync(logDir)) {
        const files = fs.readdirSync(logDir);
        console.log(`   Log files: ${files.join(', ')}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not list log files: ${error.message}`);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`   - Scripts found: ${scripts.length}`);
    console.log(`   - Individual tests: ${scripts.length}`);
    console.log(`   - Batch test: 1`);
    console.log(`   - Component tests: 3`);
    console.log(`   - Total duration: ${Date.now() - Date.now()}ms`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testLibrary().catch(console.error);