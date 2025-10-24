#!/usr/bin/env node

/**
 * Comprehensive Parallel Execution Summary Report
 * 
 * This script demonstrates the parallel execution features and generates
 * a detailed summary report showing performance improvements
 */

import { CurlRunner } from './lib/src/core/CurlRunner.js';

async function generateParallelSummaryReport() {
  console.log('🚀 cURL Runner Parallel Execution Summary Report');
  console.log('═'.repeat(60));
  
  const runner = new CurlRunner('./test-scripts', './summary-logs');
  
  try {
    // Get available scripts
    const scripts = await runner.scanScripts();
    console.log(`\n📁 Found ${scripts.length} test scripts:`);
    scripts.forEach((script, index) => {
      console.log(`   ${index + 1}. ${script}`);
    });
    
    if (scripts.length === 0) {
      console.log('⚠️  No scripts found. Please add some .sh files to ./test-scripts/');
      return;
    }

    console.log('\n🔄 Running Performance Comparison Tests...\n');

    // Test 1: Sequential Execution
    console.log('1️⃣  SEQUENTIAL EXECUTION (Baseline)');
    console.log('─'.repeat(50));
    const sequentialStart = Date.now();
    const sequentialResults = await runner.runAllScripts();
    const sequentialDuration = Date.now() - sequentialStart;
    
    console.log(`\n📊 Sequential Results:`);
    console.log(`   ✅ Successful: ${sequentialResults.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${sequentialResults.filter(r => !r.success).length}`);
    console.log(`   ⏱️  Total Duration: ${sequentialDuration}ms`);
    console.log(`   📈 Average per script: ${(sequentialDuration / scripts.length).toFixed(1)}ms`);

    // Test 2: Parallel Execution
    console.log('\n2️⃣  PARALLEL EXECUTION (Unlimited Concurrency)');
    console.log('─'.repeat(50));
    const parallelStart = Date.now();
    const parallelResults = await runner.runAllScriptsParallel();
    const parallelDuration = Date.now() - parallelStart;
    
    console.log(`\n📊 Parallel Results:`);
    console.log(`   ✅ Successful: ${parallelResults.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${parallelResults.filter(r => !r.success).length}`);
    console.log(`   ⏱️  Total Duration: ${parallelDuration}ms`);
    console.log(`   📈 Average per script: ${(parallelDuration / scripts.length).toFixed(1)}ms`);
    console.log(`   🚀 Speed Improvement: ${((sequentialDuration - parallelDuration) / sequentialDuration * 100).toFixed(1)}%`);

    // Test 3: Concurrent Execution (Batched)
    console.log('\n3️⃣  CONCURRENT EXECUTION (Batched)');
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
    console.log(`   ⏱️  Total Duration: ${concurrentDuration}ms`);
    console.log(`   📈 Average per script: ${(concurrentDuration / scripts.length).toFixed(1)}ms`);
    console.log(`   🚀 Speed Improvement: ${((sequentialDuration - concurrentDuration) / sequentialDuration * 100).toFixed(1)}%`);

    // Test 4: Custom Concurrency
    console.log('\n4️⃣  CUSTOM CONCURRENCY (Max 2)');
    console.log('─'.repeat(50));
    const customStart = Date.now();
    const customResults = await runner.runScriptsWithConcurrency(scripts, 2);
    const customDuration = Date.now() - customStart;
    
    console.log(`\n📊 Custom Concurrency Results:`);
    console.log(`   ✅ Successful: ${customResults.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${customResults.filter(r => !r.success).length}`);
    console.log(`   ⏱️  Total Duration: ${customDuration}ms`);
    console.log(`   📈 Average per script: ${(customDuration / scripts.length).toFixed(1)}ms`);
    console.log(`   🚀 Speed Improvement: ${((sequentialDuration - customDuration) / sequentialDuration * 100).toFixed(1)}%`);

    // Comprehensive Summary Report
    console.log('\n📈 COMPREHENSIVE PERFORMANCE SUMMARY');
    console.log('═'.repeat(60));
    console.log('| Execution Method    | Duration | Speed Gain | Resource Usage |');
    console.log('|---------------------|----------|-------------|----------------|');
    console.log(`| Sequential          | ${sequentialDuration.toString().padStart(6)}ms |     0.0% |         Low |`);
    console.log(`| Parallel            | ${parallelDuration.toString().padStart(6)}ms | ${((sequentialDuration - parallelDuration) / sequentialDuration * 100).toFixed(1).padStart(8)}% |        High |`);
    console.log(`| Concurrent (3)      | ${concurrentDuration.toString().padStart(6)}ms | ${((sequentialDuration - concurrentDuration) / sequentialDuration * 100).toFixed(1).padStart(8)}% |      Medium |`);
    console.log(`| Custom (2)          | ${customDuration.toString().padStart(6)}ms | ${((sequentialDuration - customDuration) / sequentialDuration * 100).toFixed(1).padStart(8)}% |      Medium |`);
    console.log('═'.repeat(60));

    // Performance Analysis
    console.log('\n🔍 PERFORMANCE ANALYSIS');
    console.log('─'.repeat(40));
    const fastestMethod = Math.min(parallelDuration, concurrentDuration, customDuration);
    const slowestMethod = Math.max(parallelDuration, concurrentDuration, customDuration);
    
    console.log(`🏆 Fastest Method: ${fastestMethod === parallelDuration ? 'Parallel' : fastestMethod === concurrentDuration ? 'Concurrent' : 'Custom Concurrency'}`);
    console.log(`🐌 Slowest Method: ${slowestMethod === parallelDuration ? 'Parallel' : slowestMethod === concurrentDuration ? 'Concurrent' : 'Custom Concurrency'}`);
    console.log(`📊 Performance Range: ${((slowestMethod - fastestMethod) / slowestMethod * 100).toFixed(1)}% difference`);
    
    // Recommendations
    console.log('\n🎯 EXECUTION METHOD RECOMMENDATIONS');
    console.log('─'.repeat(40));
    console.log('• Sequential: Use for debugging, when order matters, or resource constraints');
    console.log('• Parallel: Use for maximum speed when you have sufficient resources');
    console.log('• Concurrent: Use for balanced performance with controlled resource usage');
    console.log('• Custom Concurrency: Use for fine-tuned control over specific scenarios');

    // Resource Usage Analysis
    console.log('\n💻 RESOURCE USAGE ANALYSIS');
    console.log('─'.repeat(40));
    console.log(`• Sequential: ${scripts.length} processes sequentially`);
    console.log(`• Parallel: ${scripts.length} processes simultaneously`);
    console.log(`• Concurrent: Max ${Math.min(3, scripts.length)} processes per batch`);
    console.log(`• Custom (2): Max 2 processes simultaneously`);

    // Logging Summary
    console.log('\n📝 LOGGING SUMMARY');
    console.log('─'.repeat(40));
    console.log('• Individual script logs: Detailed execution logs for each script');
    console.log('• Report log: High-level summary of all executions');
    console.log('• Error log: Dedicated log for HTTP errors and failures');
    console.log('• Timestamps: All logs include precise timestamps');
    console.log('• Performance metrics: Duration and status tracking for each script');

    console.log('\n✅ Parallel execution features successfully demonstrated!');
    console.log('📁 Check ./summary-logs/ for detailed execution logs');

  } catch (error) {
    console.error('❌ Summary report failed:', error.message);
  }
}

// Run the comprehensive summary report
generateParallelSummaryReport().catch(console.error);
