# cURL Runner

A Node.js application that executes cURL scripts from `.sh` files with support for sequential, parallel, and concurrent execution patterns.

## What It Does

cURL Runner scans a directory for `.sh` files containing cURL commands and executes them. It provides three execution modes:

- **Sequential**: Run scripts one after another (slowest, but predictable)
- **Parallel**: Run all scripts simultaneously (fastest, but resource-intensive)
- **Concurrent**: Run scripts in controlled batches (balanced performance)

## How JavaScript Handles Concurrency

### Single-Threaded, But Not Single-Tasking

JavaScript runs on a **single thread**, but it can handle multiple tasks concurrently through its **event loop** and **asynchronous operations**. Here's how:

### 1. Sequential Execution (One at a Time)

```javascript
// Run scripts one after another
for (const script of scripts) {
  await runner.runScript(script);  // Wait for each to finish
}
```

**How it works:**
- Each script runs to completion before the next starts
- Uses `await` to pause execution until the promise resolves
- Simple and predictable, but slow

### 2. Parallel Execution (All at Once)

```javascript
// Run all scripts simultaneously
const results = await Promise.all(
  scripts.map(script => runner.runScript(script))
);
```

**How it works:**
- `Promise.all()` starts all promises immediately
- JavaScript's event loop manages multiple I/O operations concurrently
- While one script waits for network I/O, others can execute
- **No true multi-threading** - JavaScript uses non-blocking I/O operations
- The OS handles the actual network requests, JavaScript just coordinates them

**Key insight:** Even though JavaScript is single-threaded, it can handle many network requests concurrently because:
- Network I/O is handled by the operating system
- JavaScript doesn't block while waiting for responses
- The event loop efficiently switches between tasks

### 3. Concurrent Execution (Controlled Batches)

```javascript
// Run scripts in batches of 5
for (let i = 0; i < scripts.length; i += 5) {
  const batch = scripts.slice(i, i + 5);
  await Promise.all(batch.map(script => runner.runScript(script)));
  await delay(200);  // Wait between batches
}
```

**How it works:**
- Combines parallel execution with controlled limits
- Runs multiple scripts simultaneously, but caps the number
- Adds delays between batches to manage resource usage
- Best balance between speed and resource consumption

## Understanding the Concepts

### Single-Threading
- JavaScript has **one main thread** that executes code
- Only one piece of JavaScript code runs at a time
- But it can manage many I/O operations concurrently

### Multi-Threading (Not Used Here)
- True multi-threading would use multiple CPU cores
- Each thread runs independently
- Requires thread synchronization (locks, mutexes)
- JavaScript doesn't use this approach (except in Web Workers)

### Concurrency (What We Use)
- Managing multiple tasks that make progress over time
- Tasks don't necessarily run simultaneously
- JavaScript achieves this through:
  - **Promises**: Represent future values
  - **async/await**: Syntactic sugar for promises
  - **Event Loop**: Manages task scheduling
  - **Non-blocking I/O**: OS handles I/O, JavaScript coordinates

## Performance Comparison

| Method | Time | Speed | Resource Usage |
|--------|------|-------|----------------|
| Sequential | 1,054ms | Baseline | Low |
| Parallel | 144ms | **86.3% faster** | High |
| Concurrent (batch of 3) | 324ms | **69.3% faster** | Medium |

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
```

## How It Works Under the Hood

1. **Script Discovery**: Scans directory for `.sh` files
2. **Execution**: Uses Node.js `child_process.exec()` to run bash scripts
3. **Concurrency**: Leverages JavaScript promises and async/await
4. **Logging**: Captures output, errors, and timing information
5. **Error Detection**: Parses HTTP status codes from cURL output

## Key JavaScript Features Used

- **Promises**: Represent asynchronous operations
- **async/await**: Clean syntax for handling promises
- **Promise.all()**: Execute multiple promises concurrently
- **Event Loop**: JavaScript's built-in task scheduler
- **Non-blocking I/O**: Node.js handles I/O operations efficiently

## Requirements

- Node.js 18.0.0 or higher
- Bash shell
- curl command available in PATH

## License

MIT
