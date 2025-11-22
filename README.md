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

### Run with Full Output Logging
Run the processor and capture all stdout/stderr to a timestamped log file (output also shown on screen):
```bash
bash scripts/run_with_log.sh
# or via npm
npm run run:log
```

### Run with Background Logging
Run the processor and log only to file (no screen output, shows last 20 lines on error):
```bash
bash scripts/run_with_log_background.sh
# or via npm
npm run run:log:background
```

Log files are saved as: `var/logs/curl-runner-stdout_YYYY-MM-DDTHH-MM-SS.log`

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

## Git Commit Tracking

The project includes a background daemon that automatically tracks git commits and generates dynamic reports.

### Start Git Tracker

Start the background daemon to track commits:

```bash
bash scripts/start-git-tracker.sh
# or via npm
npm run git:tracker:start
```

The tracker runs in the background and:
- Monitors git commits every minute (configurable)
- Automatically generates summary and daily reports
- Stores commit data in `var/git-tracker/`
- Generates reports in `var/git-reports/`

### Stop Git Tracker

Stop the background daemon:

```bash
bash scripts/stop-git-tracker.sh
# or via npm
npm run git:tracker:stop
```

### Check Status

Check if the tracker is running and view statistics:

```bash
bash scripts/git-tracker-status.sh
# or via npm
npm run git:tracker:status
```

### View Reports

View generated reports:

```bash
# View summary report
node scripts/view-git-report.mjs summary

# View today's daily report
node scripts/view-git-report.mjs daily

# View specific day's report
node scripts/view-git-report.mjs daily 2024-01-15
```

### Report Features

The git tracker generates comprehensive reports including:

- **Summary Report** (`summary-report.json`):
  - Total commits tracked
  - Commits in last 24 hours, 7 days, 30 days
  - Code change statistics (files, insertions, deletions)
  - Top contributors
  - Recent commits
  - Time-based statistics (hourly, daily, monthly patterns)

- **Daily Reports** (`daily-report-YYYY-MM-DD.json`):
  - Commits for specific day
  - Files changed per commit
  - Author information
  - Change statistics

### Configuration

Set environment variables to customize behavior:

```bash
# Check interval in milliseconds (default: 60000 = 1 minute)
export GIT_TRACKER_INTERVAL=30000

# Custom reports directory
export GIT_REPORTS_DIR=./custom-reports

# Custom data directory
export GIT_TRACKER_DATA_DIR=./custom-data
```

## Requirements

- Node.js 18.0.0 or higher
- Bash shell
- curl command available in PATH

## Learn More

For a deeper understanding of how JavaScript handles concurrency, see [README.JS_ConcurrencyConcepts.md](./README.JS_ConcurrencyConcepts.md).

## License

MIT

