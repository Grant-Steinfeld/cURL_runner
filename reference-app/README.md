# cURL Runner Reference Implementation

This is a complete reference implementation demonstrating how to use `curl-runner-core` in a Node.js application. It serves as both documentation and a testing ground for the beta version of the library.

## Purpose

- **Reference Implementation**: Shows best practices for integrating curl-runner-core
- **Beta Testing**: Tests the latest beta version of curl-runner-core
- **Examples**: Demonstrates all execution modes (sequential, parallel, concurrent)
- **Learning**: Provides working code examples for developers

## Installation

```bash
cd reference-app
npm install
```

This will install `curl-runner-core@beta` as a dependency.

## Quick Start

### Run All Scripts (Sequential)
```bash
npm start
# or
node index.js
```

### Run Examples

```bash
# Sequential execution
npm run test:sequential

# Parallel execution (fastest)
npm run test:parallel

# Concurrent execution (batched)
npm run test:concurrent

# Single script
npm run test:single example-get.sh
```

## Project Structure

```
reference-app/
├── index.js              # Main entry point
├── examples/             # Example implementations
│   ├── sequential.js     # Sequential execution example
│   ├── parallel.js       # Parallel execution example
│   ├── concurrent.js     # Concurrent execution example
│   └── single-script.js  # Single script execution example
├── scripts/              # cURL scripts to execute
│   ├── example-get.sh
│   ├── example-post.sh
│   └── example-headers.sh
├── logs/                 # Generated log files (auto-created)
└── package.json
```

## Example Scripts

The `scripts/` directory contains example cURL scripts:

- **example-get.sh**: Simple GET request
- **example-post.sh**: POST request with JSON data
- **example-headers.sh**: Request with custom headers

You can add your own `.sh` files to test with your own endpoints.

## Usage Examples

### Sequential Execution

```javascript
import { runAllScripts } from 'curl-runner-core';

const results = await runAllScripts({
  scriptsDir: './scripts',
  logsDir: './logs'
});
```

### Parallel Execution

```javascript
import { runAllScriptsParallel } from 'curl-runner-core';

const results = await runAllScriptsParallel({
  scriptsDir: './scripts',
  logsDir: './logs'
});
```

### Concurrent Execution

```javascript
import { runAllScriptsConcurrent } from 'curl-runner-core';

const results = await runAllScriptsConcurrent({
  scriptsDir: './scripts',
  logsDir: './logs',
  batchSize: 3,
  delayBetweenBatches: 200
});
```

### Single Script

```javascript
import { runScript } from 'curl-runner-core';

const result = await runScript('example-get.sh', {
  scriptsDir: './scripts',
  logsDir: './logs'
});
```

## Logging

All execution logs are saved to the `logs/` directory:

- **Batch logs**: `run_YYYY-MM-DDTHH-MM-SS.log`
- **Individual script logs**: `script-name_YYYY-MM-DDTHH-MM-SS.log`
- **Report log**: `curl-runner-report.log` (high-level summary)
- **Error log**: `curl-api-errors.log` (HTTP 4xx/5xx errors)

## Testing the Beta

This reference app uses `curl-runner-core@beta` to test the latest beta features:

1. Install dependencies: `npm install`
2. Run examples to verify functionality
3. Check logs for proper output
4. Report any issues or feedback

## Requirements

- Node.js 18.0.0 or higher
- Bash shell
- curl command available in PATH

## License

MIT

