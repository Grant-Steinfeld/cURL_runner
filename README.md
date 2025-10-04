# cURL Runner

A Node.js application that can execute cURL scripts from standalone `.sh` files in a directory.

## Features

- 🚀 Run all `.sh` files in a directory sequentially
- 🎯 Run specific `.sh` files by name
- 📋 List all available `.sh` files
- 🎨 Colorized output with execution status
- ⏱️ Execution timing and summary statistics
- 📁 Configurable scripts directory
- 📝 Comprehensive logging to `var/logs` directory
- 🔍 Detailed execution logs with timestamps

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Run All Scripts
Execute all `.sh` files in the scripts directory:
```bash
npm start
# or
node index.js
# or
node index.js run
```

### Run Specific Script
Execute a specific `.sh` file:
```bash
node index.js run-script example-get
# or
node index.js run-script example-get.sh
```

### List Available Scripts
Show all available `.sh` files:
```bash
node index.js list
```

### Custom Directories
Specify different directories for scripts and logs:
```bash
node index.js run -d ./my-scripts -l ./my-logs
node index.js run-script my-script -d ./my-scripts -l ./my-logs
node index.js list -d ./my-scripts -l ./my-logs
```

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
├── index.js          # Main application
├── package.json      # Node.js dependencies
├── README.md         # This file
├── scripts/          # Directory for .sh files
│   ├── example-get.sh
│   ├── example-post.sh
│   └── example-headers.sh
└── var/
    └── logs/         # Execution logs directory
        ├── curl-runner-report.log    # High-level report log (tail-friendly)
        ├── curl-api-errors.log       # Dedicated API error log
        ├── run_2024-01-15T10-30-45.log
        └── example-get_2024-01-15T10-30-45.log
```

## Requirements

- Node.js 14.0.0 or higher
- Bash shell (for executing .sh files)
- curl command available in PATH

## Error Handling

The application will:
- Show clear error messages for failed scripts
- Continue executing remaining scripts even if one fails
- Provide a summary of successful vs failed executions
- Display execution timing for each script

## License

MIT