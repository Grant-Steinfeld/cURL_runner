#!/usr/bin/env node

/**
 * Example: Single Script Execution
 * Runs a specific script by name
 */

import { runScript } from 'curl-runner-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SCRIPTS_DIR = path.join(projectRoot, 'scripts');
const LOGS_DIR = path.join(projectRoot, 'logs');

async function main() {
  const scriptName = process.argv[2] || 'example-get.sh';
  
  console.log(`🎯 Single Script Execution Example: ${scriptName}\n`);
  
  const result = await runScript(scriptName, {
    scriptsDir: SCRIPTS_DIR,
    logsDir: LOGS_DIR
  });
  
  if (result.success) {
    console.log('\n✅ Script executed successfully');
    console.log(`   HTTP Status: ${result.httpStatus || 'N/A'}`);
    console.log(`   Duration: ${result.duration}ms`);
  } else {
    console.log('\n❌ Script execution failed');
    console.log(`   Error: ${result.error}`);
  }
}

main().catch(console.error);

