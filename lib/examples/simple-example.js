#!/usr/bin/env node

/**
 * Simple example demonstrating curl-runner-core parallel execution
 * 
 * This example shows how to use the library for basic parallel execution
 */

import { CurlRunner } from 'curl-runner-core';

async function simpleExample() {
  console.log('🚀 curl-runner-core Simple Example\n');
  
  // Create runner instance
  const runner = new CurlRunner('./scripts', './logs');
  
  try {
    // Check available scripts
    const scripts = await runner.scanScripts();
    console.log(`📁 Found ${scripts.length} scripts: ${scripts.join(', ')}\n`);
    
    if (scripts.length === 0) {
      console.log('⚠️  No scripts found. Please add some .sh files to ./scripts/');
      return;
    }
    
    // Run scripts in parallel
    console.log('⚡ Running scripts in parallel...');
    const startTime = Date.now();
    const results = await runner.runAllScriptsParallel();
    const duration = Date.now() - startTime;
    
    // Show results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('\n📊 Results:');
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successful scripts:');
      successful.forEach(result => {
        console.log(`   • ${result.scriptName}: ${result.duration}ms`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed scripts:');
      failed.forEach(result => {
        console.log(`   • ${result.scriptName}: ${result.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Example failed:', error.message);
  }
}

// Run the example
simpleExample().catch(console.error);
