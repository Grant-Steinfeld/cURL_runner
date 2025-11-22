#!/usr/bin/env node

/**
 * Example: Sequential Execution
 * Runs scripts one after another
 */

import { runAllScripts } from 'curl-runner-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SCRIPTS_DIR = path.join(projectRoot, 'scripts');
const LOGS_DIR = path.join(projectRoot, 'logs');

async function main() {
  console.log('🔄 Sequential Execution Example\n');
  
  const results = await runAllScripts({
    scriptsDir: SCRIPTS_DIR,
    logsDir: LOGS_DIR
  });
  
  console.log('\n✅ Sequential execution completed');
  console.log(`   Success: ${results.filter(r => r.success).length}/${results.length}`);
}

main().catch(console.error);

