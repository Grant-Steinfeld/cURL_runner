#!/usr/bin/env node

/**
 * Example: Parallel Execution
 * Runs all scripts simultaneously for maximum speed
 */

import { runAllScriptsParallel } from 'curl-runner-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SCRIPTS_DIR = path.join(projectRoot, 'scripts');
const LOGS_DIR = path.join(projectRoot, 'logs');

async function main() {
  console.log('⚡ Parallel Execution Example\n');
  
  const startTime = Date.now();
  const results = await runAllScriptsParallel({
    scriptsDir: SCRIPTS_DIR,
    logsDir: LOGS_DIR
  });
  const duration = Date.now() - startTime;
  
  console.log('\n✅ Parallel execution completed');
  console.log(`   Success: ${results.filter(r => r.success).length}/${results.length}`);
  console.log(`   Duration: ${duration}ms`);
}

main().catch(console.error);

