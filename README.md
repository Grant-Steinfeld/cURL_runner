# cURL Runner

A Node.js application that executes cURL scripts from `.sh` files with support for sequential, parallel, and concurrent execution.

## Quick Start

### Installation
```bash
npm install
```

### Run All Scripts Sequentially
```bash
bash scripts/run_all.sh
```

### Run All Scripts in Parallel
```bash
bash scripts/run_parallel.sh
```

### Run Scripts with Controlled Concurrency
```bash
bash scripts/run_concurrent.sh ./cURL_scripts ./var/logs 3 200
```

### Run a Specific Script
```bash
bash scripts/run_script.sh example-get.sh
```

### List Available Scripts
```bash
bash scripts/list_scripts.sh
```

## Programmatic Usage

```javascript
import { createRunner, runAllScripts, runAllScriptsParallel } from './index.js';

// Sequential execution
const results = await runAllScripts({
  scriptsDir: './cURL_scripts',
  logsDir: './var/logs'
});

// Parallel execution
const results = await runAllScriptsParallel({
  scriptsDir: './cURL_scripts',
  logsDir: './var/logs'
});

// Concurrent execution with batching
const results = await runAllScriptsConcurrent({
  scriptsDir: './cURL_scripts',
  logsDir: './var/logs',
  batchSize: 5,
  delayBetweenBatches: 200
});
```

## Features

- 🚀 **Sequential Execution** - Run scripts one after another
- ⚡ **Parallel Execution** - Run all scripts simultaneously (86.3% faster)
- 🔄 **Controlled Concurrency** - Run scripts in batches with configurable limits
- 📝 **Comprehensive Logging** - Detailed execution logs with timestamps
- 🚨 **Error Detection** - HTTP error detection and categorization
- 🔧 **Zero Dependencies** - Maximum security and reliability

## Execution Modes

| Method | Use Case | Speed | Resource Usage |
|--------|----------|-------|----------------|
| Sequential | Debugging, ordered execution | Slowest | Low |
| Parallel | Maximum speed | Fastest | High |
| Concurrent | Balanced performance | Medium | Medium |

## Configuration

### Environment Variables
```bash
export CURL_RUNNER_SCRIPTS_DIR=./my-scripts
export CURL_RUNNER_LOGS_DIR=./my-logs
export CURL_RUNNER_BATCH_SIZE=5
export CURL_RUNNER_DELAY=250
```

### Default Directories
- Scripts: `./cURL_scripts`
- Logs: `./var/logs`

## Script Format

Your `.sh` files should contain standalone cURL commands:

```bash
#!/bin/bash

curl -X GET "https://httpbin.org/get" \
  -H "Accept: application/json" \
  --silent \
  --show-error \
  --fail \
  --write-out "\nHTTP Status: %{http_code}\n"
```

## Logging

Logs are automatically created in the `var/logs` directory:

- **Batch runs**: `run_2024-01-15T10-30-45.log`
- **Individual scripts**: `script-name_2024-01-15T10-30-45.log`
- **Report log**: `curl-runner-report.log` (high-level summary)
- **Error log**: `curl-api-errors.log` (HTTP 4xx/5xx errors)

## Requirements

- Node.js 18.0.0 or higher
- Bash shell
- curl command available in PATH

## Learn More

For a deeper understanding of how JavaScript handles concurrency, see [README.JS_ConcurrencyConcepts.md](./README.JS_ConcurrencyConcepts.md).

## License

MIT

