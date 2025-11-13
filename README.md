# cURL Runner

[![npm version](https://badge.fury.io/js/curl-runner-core.svg)](https://badge.fury.io/js/curl-runner-core)
[![Node.js Version](https://img.shields.io/node/v/curl-runner-core)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Grant-Steinfeld/cURL_runner.svg)](https://github.com/Grant-Steinfeld/cURL_runner/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Grant-Steinfeld/cURL_runner.svg)](https://github.com/Grant-Steinfeld/cURL_runner/network)

A Node.js application c that can execute cURL scripts from standalone `.sh` files in a directory with **parallel execution capabilities** for maximum performance.

> Note: this was 99% created using Cursor with the Claude Sonnet 4 LLM

## 📦 NPM Package Available

The core functionality is also available as an NPM package:

```bash
npm install curl-runner-core
```

**Package Features:**
- ⚡ **Parallel Execution** - Run multiple scripts simultaneously (86.3% faster!)
- 🔄 **Controlled Concurrency** - Batch processing with configurable limits
- 📊 **Comprehensive Logging** - Detailed execution logs and monitoring
- 🚨 **Error Handling** - HTTP error detection and categorization
- 🔧 **Zero Dependencies** - Maximum security and reliability
- 📝 **TypeScript Support** - Complete type definitions included

**Quick Start:**
```javascript
import { CurlRunner } from 'curl-runner-core';

const runner = new CurlRunner('./scripts', './logs');

// Run all scripts in parallel (86.3% faster!)
const results = await runner.runAllScriptsParallel();

// Run with controlled concurrency
const results = await runner.runAllScriptsConcurrent({
  batchSize: 5,
  delayBetweenBatches: 200
});
```

**Package URL:** https://www.npmjs.com/package/curl-runner-core

---

[![npm version](https://badge.fury.io/js/curl-runner-core.svg)](https://badge.fury.io/js/curl-runner-core)
[![Node.js Version](https://img.shields.io/node/v/curl-runner-core)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 NPM Package

This project includes a published NPM library for easy integration:

### Installation
```bash
npm install curl-runner-core
```

### Quick Start
```javascript
import { CurlRunner, WeeklyReporter } from 'curl-runner-core';

// Initialize with weekly reporting (default: 52 weeks)
const runner = new CurlRunner('./scripts', './logs', './reports', 52);

// Run weekly data gap analysis
const weekResult = await runner.runWeeklyAnalysis(1);
console.log(`Success Rate: ${(weekResult.report.summary.overallSuccessRate * 100).toFixed(1)}%`);
```

### Package Links
- **NPM Package**: [curl-runner-core](https://www.npmjs.com/package/curl-runner-core)
- **GitHub Repository**: [Grant-Steinfeld/cURL_runner](https://github.com/Grant-Steinfeld/cURL_runner)
- **Documentation**: [Library README](https://github.com/Grant-Steinfeld/cURL_runner/blob/main/lib/README.md)

## Features

- 🚀 **Sequential Execution** - Run all `.sh` files in a directory sequentially
- ⚡ **Parallel Execution** - Run multiple scripts simultaneously (86.3% faster!)
- 🔄 **Controlled Concurrency** - Batch processing with configurable limits
- 🎯 Run specific `.sh` files by name
- 📋 List all available `.sh` files
- 🎨 Colorized output with execution status
- ⏱️ Execution timing and summary statistics
- 📁 Configurable scripts directory (default: `./cURL_scripts`)
- 📝 Comprehensive logging to `var/logs` directory
- 🔍 Detailed execution logs with timestamps
- 🚨 HTTP error detection and categorization

### NPM Library (`curl-runner-core`)
- 📊 **Weekly Data Gap Analysis** - Comprehensive reporting over configurable weeks (default: 52)
- 🔍 **Data Gap Detection** - Automatic identification of missing data and performance issues
- 📈 **Trend Analysis** - Track success rates, error patterns, and performance trends over time
- 🚨 **Error Handling** - HTTP error detection and categorization
- 📁 **File Management** - Script discovery and file system utilities
- ⚡ **High Performance** - Optimized for batch processing
- 🔧 **Modular Design** - Use individual components or the full suite
- 📝 **TypeScript Support** - Full type definitions included
- 🔒 **Zero Dependencies** - No external dependencies for maximum security

## Installation

1. Install dependencies:
```bash
npm install
```

## Testing

The project uses Node.js built-in test runner with native ES modules support:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure
- `tests/__tests__/` - All test files
- `tests/fixtures/` - Test script files
- Uses Node.js built-in test runner (no Jest configuration needed)
- Native ES modules support

## Usage

### Run All Scripts

#### Sequential Execution
Execute every `.sh` file sequentially (also used by `npm start` and `npm run dev`):
```bash
bash scripts/run_all.sh
```

Optionally pass custom directories:
```bash
bash scripts/run_all.sh ./my-scripts ./my-logs
```

#### Parallel Execution (86.3% Faster)
Run all scripts with unlimited parallelism:
```bash
bash scripts/run_parallel.sh
```

#### Controlled Concurrency
Run scripts in batches with optional delay:
```bash
# Arguments: [scripts-dir] [logs-dir] [batch-size] [delay-ms]
bash scripts/run_concurrent.sh ./cURL_scripts ./var/logs 3 200
```

### Run Specific Script
Execute a specific `.sh` file by name (with or without `.sh` suffix):
```bash
bash scripts/run_script.sh example-get
# or
bash scripts/run_script.sh example-get.sh ./cURL_scripts ./var/logs
```

### List Available Scripts
Show the discoverable `.sh` files:
```bash
bash scripts/list_scripts.sh
```

### Custom Directories via Environment
Instead of passing arguments you can export environment variables before invoking the shell helpers:
```bash
export CURL_RUNNER_SCRIPTS_DIR=./my-scripts
export CURL_RUNNER_LOGS_DIR=./my-logs
export CURL_RUNNER_BATCH_SIZE=5      # optional, used by run_concurrent.sh
export CURL_RUNNER_DELAY=250         # optional, used by run_concurrent.sh
bash scripts/run_all.sh
```

## Performance Comparison

The new parallel execution features provide dramatic performance improvements:

| Execution Method | Duration | Speed Improvement | Resource Usage |
|------------------|----------|-------------------|----------------|
| **Sequential** | 1,054ms | 0.0% (baseline) | Low |
| **Parallel** | 144ms | **86.3% faster** | High |
| **Concurrent (3)** | 324ms | **69.3% faster** | Medium |
| **Custom (2)** | 330ms | **68.7% faster** | Medium |

### Choosing the Right Execution Method

- **Sequential**: Use for debugging, when order matters, or resource constraints
- **Parallel**: Use for maximum speed when you have sufficient resources
- **Concurrent**: Use for balanced performance with controlled resource usage
- **Custom Concurrency**: Use for fine-tuned control over specific scenarios

## Script Format

Your `.sh` files should contain standalone cURL commands. Here's an example:

```bash
#!/bin/bash

# Example GET request
curl -X GET "https://httpbin.org/get" \
  -H "Accept: application/json" \
  -H "User-Agent: curl-runner/1.0" \
  --silent \
  --show-error \
  --fail \
  --write-out "\nHTTP Status: %{http_code}\nTotal Time: %{time_total}s\n"
```

## Example Scripts

The project includes three example scripts in the `scripts/` directory:

- `example-get.sh` - Simple GET request
- `example-post.sh` - POST request with JSON data
- `example-headers.sh` - Request with custom headers

## Logging

The application automatically logs all script executions to the `var/logs` directory:

- **Batch runs**: Creates logs like `run_2024-01-15T10-30-45.log`
- **Individual scripts**: Creates logs like `example-get_2024-01-15T10-30-45.log`
- **High-level report log**: `curl-runner-report.log` - perfect for tailing
- **API error log**: `curl-api-errors.log` - dedicated log for HTTP 4xx/5xx errors
- **Log content**: Includes timestamps, execution status, output, errors, and timing
- **Automatic directory creation**: Creates `var/logs` if it doesn't exist

### Detailed Log File Format
```
[2024-01-15T10:30:45.123Z] Starting batch execution of 3 scripts
[2024-01-15T10:30:45.124Z] Scripts to run: example-get.sh, example-post.sh, example-headers.sh
[2024-01-15T10:30:45.125Z] Starting execution of script: example-get.sh
[2024-01-15T10:30:46.234Z] SUCCESS: example-get.sh completed successfully in 1109ms
[2024-01-15T10:30:46.235Z] OUTPUT: {"args":{},"headers":{"Accept":"application/json",...}}
```

### High-Level Report Log Format (Perfect for Tailing)
```
[2024-01-15T10:30:45.123Z] 🚀 BATCH START: Running 3 scripts
[2024-01-15T10:30:45.125Z] ✅ SUCCESS: example-get.sh (1109ms)
[2024-01-15T10:30:46.234Z] ✅ SUCCESS: example-post.sh (856ms)
[2024-01-15T10:30:47.090Z] ❌ FAILED: example-headers.sh (234ms) - Connection timeout
[2024-01-15T10:30:47.091Z] 🏁 BATCH COMPLETE: 2/3 successful (1 failed)
```

### API Error Log Format
```
[2025-10-03T23:54:10.062Z] ❌ API ERROR: test-api-error.sh (3136ms)
[2025-10-03T23:54:10.062Z] Error: Command failed: bash "scripts/test-api-error.sh"
curl: (56) The requested URL returned error: 404
[2025-10-03T23:54:10.062Z] ─────────────────────────────────────────
```

### Tailing the Logs
```bash
# Watch the report log in real-time
tail -f var/logs/curl-runner-report.log

# Watch API errors in real-time
tail -f var/logs/curl-api-errors.log

# Watch both logs simultaneously
tail -f var/logs/curl-runner-report.log var/logs/curl-api-errors.log

# Watch with timestamps
tail -f var/logs/curl-runner-report.log | while read line; do echo "$(date '+%H:%M:%S') $line"; done
```

## Project Structure

```
cURL_runner/
├── index.js          # Main application (ES modules)
├── package.json      # Node.js dependencies and scripts
├── README.md         # This file
├── docs/             # Documentation directory
│   ├── README.md     # Documentation index
│   ├── SEPARATION_OF_CONCERNS.md
│   ├── TEST_MOCKING_UPDATE.md
│   └── HowJestNeededToBeConfiguredForESModules.md
├── src/              # Source code (ES modules)
│   ├── config/       # Configuration
│   ├── lib/          # Core business logic
│   └── utils/        # Utility classes
├── scripts/          # Shell helpers & lightweight Node entrypoints
│   ├── list-scripts.mjs
│   ├── list_scripts.sh
│   ├── run-all.mjs
│   ├── run-concurrent.mjs
│   ├── run-parallel.mjs
│   ├── run-script.mjs
│   ├── run_all.sh
│   ├── run_concurrent.sh
│   ├── run_parallel.sh
│   └── run_script.sh
├── cURL_scripts/     # Example cURL `.sh` files executed by the runner
├── tests/            # Testing framework
│   ├── unit/         # Unit tests
│   ├── integration/  # Integration tests
│   ├── e2e/          # End-to-end tests
│   └── fixtures/     # Test script files
└── var/
    └── logs/         # Execution logs directory
        ├── curl-runner-report.log    # High-level report log (tail-friendly)
        ├── curl-api-errors.log       # Dedicated API error log
        ├── run_2024-01-15T10-30-45.log
        └── example-get_2024-01-15T10-30-45.log
```

## Requirements

- **Node.js 18.0.0 or higher** (required for built-in test runner and ES modules)
- **Bash shell** (for executing .sh files)
- **curl command** available in PATH

> **Note**: Node.js 18.0.0+ is required because this project uses the built-in test runner (`node:test`) and built-in assert module (`node:assert`) which were introduced in Node.js 18.0.0. See [Node.js Version Requirements](docs/NODE_VERSION_REQUIREMENTS.md) for detailed information.

## Development

### Testing Framework
- **Node.js Built-in Test Runner** - Native ES modules support
- **No Jest configuration needed** - Works out of the box with ES modules
- **Coverage support** - Using c8 for code coverage
- **Watch mode** - Automatic test re-running during development

### ES Modules
- **Modern JavaScript** - Uses `import`/`export` syntax
- **No transformation needed** - Node.js native support
- **Type: module** - Configured in package.json

### Testing Approach
This project demonstrates effective problem-solving by **breaking patterns** when stuck:

1. **Initial Challenge**: Jest doesn't work well with ES modules out of the box
2. **Pattern Breaking**: Instead of fighting Jest configuration, switched to Node.js built-in test runner
3. **Result**: Native ES modules support with zero configuration needed

**Key Learning**: When stuck in a loop, completely change the approach rather than trying to fix the same method repeatedly.

## Error Handling

The application will:
- Show clear error messages for failed scripts
- Continue executing remaining scripts even if one fails
- Provide a summary of successful vs failed executions
- Display execution timing for each script

## Documentation

Additional documentation is available in the [`docs/`](docs/) directory:

- **[Architecture & Design](docs/)** - Detailed documentation about the project structure and design decisions
- **[Separation of Concerns](docs/SEPARATION_OF_CONCERNS.md)** - Modular architecture implementation
- **[Test Mocking Update](docs/TEST_MOCKING_UPDATE.md)** - Testing strategies and utility class testing
- **[Node.js Compatibility Analysis](docs/NODE_COMPATIBILITY_ANALYSIS.md)** - Visual analysis with Mermaid diagrams
- **[Jest Migration History](docs/HowJestNeededToBeConfiguredForESModules.md)** - Historical context of the Jest to Node.js test runner migration

## License

MIT

## Development & AI-Assisted Creation

This application was created with the assistance of **Cursor** and its underlying **Claude Sonnet 4** LLM. The development process leveraged AI-assisted coding to implement:

- ⚡ **Parallel execution algorithms** with Promise.all() and controlled concurrency
- 🔧 **Complex configuration management** for batch processing and delays
- 📊 **Comprehensive logging systems** with timestamp tracking and error categorization
- 🧪 **Extensive test suites** covering parallel execution scenarios
- 📝 **Complete TypeScript definitions** for all new methods
- 🚀 **NPM package optimization** with zero dependencies and proper build configuration

The AI assistance was particularly valuable for:
- Implementing efficient parallel execution patterns
- Creating comprehensive error handling and logging
- Generating extensive documentation and examples
- Optimizing package configuration for npm publishing
- Writing thorough test coverage for edge cases

This demonstrates the power of AI-assisted development in creating production-ready, well-documented, and thoroughly tested applications.