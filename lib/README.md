# curl-runner-core

[![npm version](https://badge.fury.io/js/curl-runner-core.svg)](https://badge.fury.io/js/curl-runner-core)
[![Node.js Version](https://img.shields.io/node/v/curl-runner-core)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Core library for running cURL scripts with comprehensive logging and error handling. This library provides the essential functionality for executing cURL scripts, parsing output, and managing logs without CLI dependencies.

## 🚀 Features

- **🔄 cURL Script Execution** - Run individual or batch cURL scripts
- **⚡ Parallel Execution** - Run multiple scripts simultaneously for maximum performance
- **🔄 Controlled Concurrency** - Batch processing with configurable limits
- **📊 Comprehensive Logging** - Detailed logs with timestamps and status tracking
- **🚨 Error Handling** - HTTP error detection and categorization
- **📁 File Management** - Script discovery and file system utilities
- **🔧 Modular Design** - Use individual components or the full suite
- **📝 TypeScript Support** - Full type definitions included

## 📦 Installation

```bash
npm install curl-runner-core
```

## 📋 Requirements

- **Node.js**: >=18.0.0 (ES modules and built-in test runner)
  - **Tested**: v22.18.0 (current)
  - **Compatible**: v18.0.0 - v24.x.x
  - **Recommended**: v22.x.x - v24.x.x for best performance
- **Operating Systems**: macOS, Linux, Windows
- **Dependencies**: Zero external dependencies (maximum security)

### 🔒 **Automatic Compatibility Enforcement**

The library automatically enforces Node.js version compatibility when imported:

- **✅ Supported Versions**: v18.0.0+ (library loads normally)
- **⚠️ Unsupported Versions**: <v18.0.0 (throws clear error with upgrade instructions)
- **📢 Warnings**: Non-recommended versions show helpful warnings
- **🔧 Programmatic Access**: Check compatibility status in your code

## 🎯 Quick Start

### Basic Usage

```javascript
import { CurlRunner } from 'curl-runner-core';

// Create a new runner instance
const runner = new CurlRunner({
  scriptsDir: './scripts',
  logsDir: './logs'
});

// Run all scripts in parallel (unlimited concurrency)
const parallelResults = await runner.runAllScriptsParallel();
console.log(`Parallel execution: ${parallelResults.length} scripts`);

// Run scripts with controlled concurrency (batched)
const concurrentResults = await runner.runAllScriptsConcurrent({
  batchSize: 5,
  delayBetweenBatches: 200
});
console.log(`Concurrent execution: ${concurrentResults.length} scripts`);

// Run specific scripts with custom concurrency limit
const scripts = ['script1.sh', 'script2.sh', 'script3.sh'];
const customResults = await runner.runScriptsWithConcurrency(scripts, 3);
console.log(`Custom concurrency: ${customResults.length} scripts`);

// Run a specific script
const result = await runner.runScript('example-get.sh');
console.log('Script result:', result);
```

### Individual Components

```javascript
import { Logger, CurlParser, FileSystem } from 'curl-runner-core';

// Use the logger
const logger = new Logger('./logs');
await logger.writeLog('script-name', 'Log content here');

// Parse cURL output
const parser = new CurlParser();
const parsed = parser.parseCurlOutput(curlOutput);

// File system operations
const fs = new FileSystem();
const scripts = await fs.scanScripts('./scripts');
```

### Compatibility Checking

```javascript
import { 
  getCompatibilityInfo, 
  isTestedVersion, 
  isRecommendedVersion,
  getCompatibilityMatrix 
} from 'curl-runner-core';

// Check compatibility status
const info = getCompatibilityInfo();
console.log(`Node.js ${info.currentVersion} is ${info.isSupported ? 'supported' : 'not supported'}`);

// Check specific version ranges
if (isTestedVersion()) {
  console.log('Using a tested Node.js version');
}

if (isRecommendedVersion()) {
  console.log('Using a recommended Node.js version');
}

// Get full compatibility matrix
const matrix = getCompatibilityMatrix();
console.log('Compatibility matrix:', matrix);
```

## 📚 API Reference

### CurlRunner

The main class for running cURL scripts.

#### Constructor

```javascript
new CurlRunner(config?: CurlRunnerConfig)
```

**Config Options:**
- `scriptsDir` (string): Directory containing .sh files (default: './scripts')
- `logsDir` (string): Directory for log files (default: './var/logs')
- `reportLogFile` (string): Report log filename (default: 'curl-runner-report.log')
- `errorLogFile` (string): Error log filename (default: 'curl-api-errors.log')
- `scriptExtension` (string): Script file extension (default: '.sh')
- `scriptDelayMs` (number): Delay between scripts (default: 1000)

#### Methods

##### `runAllScripts(): Promise<CurlResult[]>`
Runs all scripts in the scripts directory sequentially.

##### `runAllScriptsParallel(): Promise<CurlResult[]>`
Runs all scripts in the scripts directory in parallel (unlimited concurrency).

##### `runAllScriptsConcurrent(options?: ConcurrentOptions): Promise<CurlResult[]>`
Runs all scripts with controlled concurrency using batched parallel execution.

**ConcurrentOptions:**
- `batchSize` (number): Number of scripts to run simultaneously (default: 5)
- `delayBetweenBatches` (number): Delay between batches in milliseconds (default: 200)

##### `runScriptsWithConcurrency(scripts: string[], maxConcurrent?: number): Promise<CurlResult[]>`
Runs specific scripts with custom concurrency control.

**Parameters:**
- `scripts` (string[]): Array of script names to run
- `maxConcurrent` (number): Maximum number of concurrent executions (default: 10)

##### `runScript(scriptName: string): Promise<CurlResult>`
Runs a specific script by name.

##### `scanScripts(): Promise<ScriptInfo[]>`
Scans the scripts directory and returns available scripts.

### Logger

Handles all logging operations.

#### Methods

##### `writeLog(scriptName: string, content: string): Promise<void>`
Writes a log entry for a specific script.

##### `writeReportLog(message: string): Promise<void>`
Writes to the report log.

##### `writeErrorLog(error: string): Promise<void>`
Writes to the error log.

### CurlParser

Parses cURL output and extracts useful information.

#### Methods

##### `parseCurlOutput(output: string): CurlResult`
Parses raw cURL output into a structured result.

##### `extractHttpStatus(output: string): number | null`
Extracts HTTP status code from cURL output.

##### `isHttpError(status: number): boolean`
Checks if an HTTP status code represents an error.

### FileSystem

Handles file system operations.

#### Methods

##### `scanScripts(directory: string): Promise<ScriptInfo[]>`
Scans a directory for script files.

##### `fileExists(filePath: string): Promise<boolean>`
Checks if a file exists.

## 🔧 Configuration

### Parallel Execution Configuration

```javascript
import { DEFAULT_CONFIG } from 'curl-runner-core';

console.log(DEFAULT_CONFIG);
// {
//   SCRIPTS_DIR: './scripts',
//   LOGS_DIR: './var/logs',
//   REPORT_LOG_FILE: 'curl-runner-report.log',
//   ERROR_LOG_FILE: 'curl-api-errors.log',
//   SCRIPT_EXTENSION: '.sh',
//   SCRIPT_DELAY_MS: 100,
//   PARALLEL_ENABLED: false,
//   PARALLEL_BATCH_SIZE: 5,
//   PARALLEL_MAX_CONCURRENT: 10,
//   PARALLEL_DELAY_BETWEEN_BATCHES: 200
// }
```

### Performance Comparison

| Execution Method | Use Case | Performance | Resource Usage |
|------------------|----------|-------------|----------------|
| **Sequential** | Safe, reliable execution | Slowest | Lowest |
| **Parallel** | Maximum speed | Fastest | Highest |
| **Concurrent** | Balanced performance | Fast | Moderate |
| **Custom Concurrency** | Fine-tuned control | Configurable | Configurable |

### Choosing the Right Execution Method

- **Sequential (`runAllScripts`)**: Use when you need guaranteed order, debugging, or have resource constraints
- **Parallel (`runAllScriptsParallel`)**: Use for maximum speed when you have sufficient resources
- **Concurrent (`runAllScriptsConcurrent`)**: Use for balanced performance with controlled resource usage
- **Custom Concurrency (`runScriptsWithConcurrency`)**: Use when you need fine-grained control over specific scripts

## 📊 Logging

The library provides comprehensive logging:

- **Individual Script Logs**: `{script-name}_{timestamp}.log`
- **Report Log**: High-level summary of all executions
- **Error Log**: Dedicated log for HTTP errors and failures

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "script": "example-get.sh",
  "status": "success",
  "duration": 1850,
  "httpStatus": 200,
  "output": "..."
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 TypeScript Support

Full TypeScript definitions are included:

```typescript
import { CurlRunner, CurlResult, LoggerConfig } from 'curl-runner-core';

const runner: CurlRunner = new CurlRunner();
const result: CurlResult = await runner.runScript('test.sh');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [curl-runner-cli](https://github.com/Grant-Steinfeld/cURL_runner) - CLI application using this library
- [curl-runner-web](https://github.com/Grant-Steinfeld/cURL_runner-web) - Web interface (coming soon)

## 📞 Support

- 📧 Email: support@curl-runner.dev
- 🐛 Issues: [GitHub Issues](https://github.com/Grant-Steinfeld/cURL_runner/issues)
- 📖 Documentation: [Full Documentation](https://curl-runner.dev/docs)