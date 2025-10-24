# curl-runner-core Examples

This directory contains comprehensive examples demonstrating the parallel execution capabilities of the curl-runner-core library.

## 🚀 Quick Start Examples

### Basic Usage

```javascript
import { CurlRunner } from 'curl-runner-core';

// Create a runner instance
const runner = new CurlRunner({
  scriptsDir: './scripts',
  logsDir: './logs'
});

// Run all scripts sequentially (original behavior)
const results = await runner.runAllScripts();
console.log(`Executed ${results.length} scripts`);
```

### Parallel Execution Examples

```javascript
// Run all scripts in parallel (maximum speed)
const parallelResults = await runner.runAllScriptsParallel();
console.log(`Parallel execution: ${parallelResults.length} scripts`);

// Run scripts with controlled concurrency (batched)
const concurrentResults = await runner.runAllScriptsConcurrent({
  batchSize: 5,
  delayBetweenBatches: 200
});
console.log(`Concurrent execution: ${concurrentResults.length} scripts`);

// Run specific scripts with custom concurrency limit
const scripts = ['api-test1.sh', 'api-test2.sh', 'api-test3.sh'];
const customResults = await runner.runScriptsWithConcurrency(scripts, 3);
console.log(`Custom concurrency: ${customResults.length} scripts`);
```

## 📊 Performance Comparison Example

```javascript
import { CurlRunner } from 'curl-runner-core';

async function performanceComparison() {
  const runner = new CurlRunner('./test-scripts', './performance-logs');
  
  // Sequential execution (baseline)
  console.log('🔄 Running sequential execution...');
  const sequentialStart = Date.now();
  const sequentialResults = await runner.runAllScripts();
  const sequentialDuration = Date.now() - sequentialStart;
  
  // Parallel execution
  console.log('⚡ Running parallel execution...');
  const parallelStart = Date.now();
  const parallelResults = await runner.runAllScriptsParallel();
  const parallelDuration = Date.now() - parallelStart;
  
  // Performance summary
  const speedImprovement = ((sequentialDuration - parallelDuration) / sequentialDuration * 100).toFixed(1);
  
  console.log('\n📈 Performance Results:');
  console.log(`Sequential: ${sequentialDuration}ms`);
  console.log(`Parallel: ${parallelDuration}ms`);
  console.log(`Speed Improvement: ${speedImprovement}%`);
  
  return {
    sequential: { duration: sequentialDuration, results: sequentialResults },
    parallel: { duration: parallelDuration, results: parallelResults },
    speedImprovement: parseFloat(speedImprovement)
  };
}

// Run the comparison
performanceComparison().then(results => {
  console.log('Performance comparison completed:', results);
});
```

## 🔧 Configuration Examples

### Custom Configuration

```javascript
import { CurlRunner, DEFAULT_CONFIG } from 'curl-runner-core';

// Use default configuration
const defaultRunner = new CurlRunner();

// Custom configuration
const customRunner = new CurlRunner({
  scriptsDir: './my-scripts',
  logsDir: './my-logs',
  reportLogFile: 'custom-report.log',
  errorLogFile: 'custom-errors.log',
  scriptExtension: '.bash',
  scriptDelayMs: 500
});

// Parallel execution configuration
const parallelConfig = {
  ...DEFAULT_CONFIG,
  PARALLEL_BATCH_SIZE: 10,
  PARALLEL_MAX_CONCURRENT: 20,
  PARALLEL_DELAY_BETWEEN_BATCHES: 100
};
```

### Environment-Specific Configuration

```javascript
import { CurlRunner } from 'curl-runner-core';

// Development environment
const devRunner = new CurlRunner({
  scriptsDir: './scripts/dev',
  logsDir: './logs/dev',
  scriptDelayMs: 1000  // Slower for debugging
});

// Production environment
const prodRunner = new CurlRunner({
  scriptsDir: './scripts/prod',
  logsDir: './logs/prod',
  scriptDelayMs: 100   // Faster for production
});

// Run with different strategies based on environment
const isProduction = process.env.NODE_ENV === 'production';
const runner = isProduction ? prodRunner : devRunner;

if (isProduction) {
  // Use parallel execution in production for speed
  await runner.runAllScriptsParallel();
} else {
  // Use sequential execution in development for debugging
  await runner.runAllScripts();
}
```

## 📝 Logging and Monitoring Examples

### Comprehensive Logging

```javascript
import { CurlRunner, Logger } from 'curl-runner-core';

const runner = new CurlRunner('./scripts', './logs');

// Run scripts and capture detailed results
const results = await runner.runAllScriptsParallel();

// Analyze results
const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`✅ Successful: ${successful.length}`);
console.log(`❌ Failed: ${failed.length}`);

// Log detailed information
successful.forEach(result => {
  console.log(`✅ ${result.scriptName}: ${result.duration}ms (HTTP ${result.httpStatus})`);
});

failed.forEach(result => {
  console.log(`❌ ${result.scriptName}: ${result.error}`);
});

// Access individual logs
const logger = new Logger('./logs');
const logFiles = await logger.getLogFiles();
console.log('Available log files:', logFiles);
```

### Error Handling and Recovery

```javascript
import { CurlRunner } from 'curl-runner-core';

async function robustExecution() {
  const runner = new CurlRunner('./scripts', './logs');
  
  try {
    // Try parallel execution first
    const results = await runner.runAllScriptsParallel();
    
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log(`⚠️ ${failed.length} scripts failed, retrying sequentially...`);
      
      // Retry failed scripts sequentially
      for (const failedScript of failed) {
        console.log(`🔄 Retrying ${failedScript.scriptName}...`);
        const retryResult = await runner.runScript(failedScript.scriptName);
        if (retryResult.success) {
          console.log(`✅ ${failedScript.scriptName} succeeded on retry`);
        } else {
          console.log(`❌ ${failedScript.scriptName} failed again: ${retryResult.error}`);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Execution failed:', error.message);
    throw error;
  }
}
```

## 🎯 Real-World Use Cases

### API Testing Suite

```javascript
import { CurlRunner } from 'curl-runner-core';

class APITestSuite {
  constructor(environment = 'dev') {
    this.runner = new CurlRunner(`./tests/${environment}`, `./logs/${environment}`);
    this.environment = environment;
  }
  
  async runAllTests() {
    console.log(`🧪 Running API tests for ${this.environment} environment...`);
    
    // Run all test scripts in parallel for speed
    const results = await this.runner.runAllScriptsParallel();
    
    // Generate test report
    const report = this.generateTestReport(results);
    console.log('📊 Test Report:', report);
    
    return report;
  }
  
  async runSmokeTests() {
    console.log('🔥 Running smoke tests...');
    
    // Run critical tests first
    const criticalTests = ['health-check.sh', 'auth-test.sh', 'basic-crud.sh'];
    const results = await this.runner.runScriptsWithConcurrency(criticalTests, 2);
    
    const allPassed = results.every(r => r.success);
    if (!allPassed) {
      throw new Error('Smoke tests failed - stopping deployment');
    }
    
    console.log('✅ All smoke tests passed');
    return results;
  }
  
  generateTestReport(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    return {
      total: results.length,
      passed: successful.length,
      failed: failed.length,
      passRate: (successful.length / results.length * 100).toFixed(1),
      duration: Math.max(...results.map(r => r.duration)),
      failures: failed.map(r => ({
        script: r.scriptName,
        error: r.error,
        httpStatus: r.httpStatus
      }))
    };
  }
}

// Usage
const testSuite = new APITestSuite('staging');
await testSuite.runSmokeTests();
await testSuite.runAllTests();
```

### Load Testing with Controlled Concurrency

```javascript
import { CurlRunner } from 'curl-runner-core';

class LoadTester {
  constructor(scriptsDir, logsDir) {
    this.runner = new CurlRunner(scriptsDir, logsDir);
  }
  
  async runLoadTest(maxConcurrent = 10, iterations = 5) {
    console.log(`🚀 Starting load test: ${maxConcurrent} concurrent, ${iterations} iterations`);
    
    const allResults = [];
    
    for (let i = 0; i < iterations; i++) {
      console.log(`📊 Iteration ${i + 1}/${iterations}`);
      
      const results = await this.runner.runScriptsWithConcurrency(
        await this.runner.scanScripts(),
        maxConcurrent
      );
      
      allResults.push(...results);
      
      // Brief pause between iterations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return this.analyzeLoadTestResults(allResults);
  }
  
  analyzeLoadTestResults(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const durations = results.map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    
    return {
      totalRequests: results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: (successful.length / results.length * 100).toFixed(2),
      avgResponseTime: avgDuration.toFixed(2),
      maxResponseTime: maxDuration,
      minResponseTime: minDuration,
      throughput: (results.length / (maxDuration / 1000)).toFixed(2) // requests per second
    };
  }
}

// Usage
const loadTester = new LoadTester('./load-test-scripts', './load-test-logs');
const results = await loadTester.runLoadTest(20, 10);
console.log('📈 Load Test Results:', results);
```

## 🔄 Migration from Sequential to Parallel

### Gradual Migration Strategy

```javascript
import { CurlRunner } from 'curl-runner-core';

class MigrationHelper {
  constructor(scriptsDir, logsDir) {
    this.runner = new CurlRunner(scriptsDir, logsDir);
  }
  
  async migrateToParallel() {
    console.log('🔄 Starting migration to parallel execution...');
    
    // Step 1: Run sequential to establish baseline
    console.log('1️⃣ Running sequential baseline...');
    const sequentialResults = await this.runner.runAllScripts();
    const sequentialDuration = sequentialResults.reduce((sum, r) => sum + r.duration, 0);
    
    // Step 2: Run with small batch size
    console.log('2️⃣ Testing with small batch size...');
    const smallBatchResults = await this.runner.runAllScriptsConcurrent({
      batchSize: 2,
      delayBetweenBatches: 500
    });
    
    // Step 3: Run with medium batch size
    console.log('3️⃣ Testing with medium batch size...');
    const mediumBatchResults = await this.runner.runAllScriptsConcurrent({
      batchSize: 5,
      delayBetweenBatches: 200
    });
    
    // Step 4: Run full parallel
    console.log('4️⃣ Testing full parallel execution...');
    const parallelResults = await this.runner.runAllScriptsParallel();
    
    // Compare results
    const comparison = {
      sequential: { duration: sequentialDuration, results: sequentialResults },
      smallBatch: { duration: this.calculateTotalDuration(smallBatchResults), results: smallBatchResults },
      mediumBatch: { duration: this.calculateTotalDuration(mediumBatchResults), results: mediumBatchResults },
      parallel: { duration: this.calculateTotalDuration(parallelResults), results: parallelResults }
    };
    
    console.log('📊 Migration Analysis:', comparison);
    return comparison;
  }
  
  calculateTotalDuration(results) {
    return Math.max(...results.map(r => r.duration));
  }
}

// Usage
const migrationHelper = new MigrationHelper('./scripts', './migration-logs');
await migrationHelper.migrateToParallel();
```

These examples demonstrate the full power and flexibility of the @curl-runner/core library with its new parallel execution capabilities!
