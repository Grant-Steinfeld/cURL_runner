#!/usr/bin/env node

/**
 * Example demonstrating parallel execution features of @curl-runner/core
 * 
 * This script shows different ways to run cURL scripts in parallel
 */

import { CurlRunner } from './src/index.js';

async function demonstrateParallelExecution() {
  console.log('🚀 @curl-runner/core Parallel Execution Demo\n');

  // Create runner instance
  const runner = new CurlRunner('./test-scripts', './demo-logs');
  
  try {
    // Check available scripts
    console.log('📁 Available scripts:');
    const scripts = await runner.scanScripts();
    console.log(`   Found ${scripts.length} scripts: ${scripts.join(', ')}\n`);

    if (scripts.length === 0) {
      console.log('⚠️  No scripts found. Please add some .sh files to ./test-scripts/');
      return;
    }

    // Demo 1: Sequential execution (baseline)
    console.log('🔄 Demo 1: Sequential Execution (Baseline)');
    console.log('─'.repeat(50));
    const sequentialStart = Date.now();
    const sequentialResults = await runner.runAllScripts();
    const sequentialDuration = Date.now() - sequentialStart;
    
    console.log(`\n📊 Sequential Results:`);
    console.log(`   ✅ Successful: ${sequentialResults.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${sequentialResults.filter(r => !r.success).length}`);
    console.log(`   ⏱️  Duration: ${sequentialDuration}ms\n`);

    // Demo 2: Parallel execution (unlimited concurrency)
    console.log('⚡ Demo 2: Parallel Execution (Unlimited Concurrency)');
    console.log('─'.repeat(50));
    const parallelStart = Date.now();
    const parallelResults = await runner.runAllScriptsParallel();
    const parallelDuration = Date.now() - parallelStart;
    
    console.log(`\n📊 Parallel Results:`);
    console.log(`   ✅ Successful: ${parallelResults.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${parallelResults.filter(r => !r.success).length}`);
    console.log(`   ⏱️  Duration: ${parallelDuration}ms`);
    console.log(`   🚀 Speed Improvement: ${((sequentialDuration - parallelDuration) / sequentialDuration * 100).toFixed(1)}%\n`);

    // Demo 3: Concurrent execution (batched)
    console.log('🔄 Demo 3: Concurrent Execution (Batched)');
    console.log('─'.repeat(50));
    const concurrentStart = Date.now();
    const concurrentResults = await runner.runAllScriptsConcurrent({
      batchSize: 3,
      delayBetweenBatches: 100
    });
    const concurrentDuration = Date.now() - concurrentStart;
    
    console.log(`\n📊 Concurrent Results:`);
    console.log(`   ✅ Successful: ${concurrentResults.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${concurrentResults.filter(r => !r.success).length}`);
    console.log(`   ⏱️  Duration: ${concurrentDuration}ms`);
    console.log(`   🚀 Speed Improvement: ${((sequentialDuration - concurrentDuration) / sequentialDuration * 100).toFixed(1)}%\n`);

    // Demo 4: Custom concurrency control
    console.log('⚙️  Demo 4: Custom Concurrency Control');
    console.log('─'.repeat(50));
    const customStart = Date.now();
    const customResults = await runner.runScriptsWithConcurrency(scripts, 2);
    const customDuration = Date.now() - customStart;
    
    console.log(`\n📊 Custom Concurrency Results:`);
    console.log(`   ✅ Successful: ${customResults.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${customResults.filter(r => !r.success).length}`);
    console.log(`   ⏱️  Duration: ${customDuration}ms`);
    console.log(`   🚀 Speed Improvement: ${((sequentialDuration - customDuration) / sequentialDuration * 100).toFixed(1)}%\n`);

    // Performance Summary
    console.log('📈 Performance Summary');
    console.log('═'.repeat(50));
    console.log(`Sequential:     ${sequentialDuration}ms (baseline)`);
    console.log(`Parallel:       ${parallelDuration}ms (${((sequentialDuration - parallelDuration) / sequentialDuration * 100).toFixed(1)}% faster)`);
    console.log(`Concurrent:     ${concurrentDuration}ms (${((sequentialDuration - concurrentDuration) / sequentialDuration * 100).toFixed(1)}% faster)`);
    console.log(`Custom (2):     ${customDuration}ms (${((sequentialDuration - customDuration) / sequentialDuration * 100).toFixed(1)}% faster)`);
    
    console.log('\n🎯 Recommendations:');
    console.log('   • Use Sequential for debugging or when order matters');
    console.log('   • Use Parallel for maximum speed with sufficient resources');
    console.log('   • Use Concurrent for balanced performance and resource control');
    console.log('   • Use Custom Concurrency for fine-tuned control');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
demonstrateParallelExecution().catch(console.error);
