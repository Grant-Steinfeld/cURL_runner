#!/usr/bin/env node

/**
 * Example: Concurrent Execution
 * Runs scripts in controlled batches with delays
 */

import { runAllScriptsConcurrent } from 'curl-runner-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SCRIPTS_DIR = path.join(projectRoot, 'scripts');
const LOGS_DIR = path.join(projectRoot, 'logs');

async function main() {
  console.log('🔄 Concurrent Execution Example (Batch Size: 3, Delay: 200ms)\n');
  
  const startTime = Date.now();
  const results = await runAllScriptsConcurrent({
    scriptsDir: SCRIPTS_DIR,
    logsDir: LOGS_DIR,
    batchSize: 3,
    delayBetweenBatches: 200
  });
  const duration = Date.now() - startTime;
  
  console.log('\n✅ Concurrent execution completed');
  console.log(`   Success: ${results.filter(r => r.success).length}/${results.length}`);
  console.log(`   Duration: ${duration}ms`);
  console.log(`   Batches: ${Math.ceil(results.length / 3)}`);
}

main().catch(console.error);

