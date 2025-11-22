#!/usr/bin/env node

/**
 * Reference Implementation - Main Entry Point
 * 
 * This demonstrates how to use curl-runner-core in a Node.js application.
 */

import { createRunner, runAllScripts, listScripts } from '../index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPTS_DIR = path.join(__dirname, 'scripts');
const LOGS_DIR = path.join(__dirname, 'logs');

async function main() {
  console.log('🚀 cURL Runner Reference Implementation\n');
  console.log('─'.repeat(60));
  
  // List available scripts
  console.log('\n📋 Available Scripts:');
  const scripts = listScripts({ scriptsDir: SCRIPTS_DIR });
  if (scripts.length === 0) {
    console.log('  ⚠️  No scripts found. Add some .sh files to the scripts/ directory.');
    return;
  }
  scripts.forEach((script, index) => {
    console.log(`  ${index + 1}. ${script}`);
  });
  
  // Run all scripts sequentially
  console.log('\n🎯 Running all scripts sequentially...\n');
  const results = await runAllScripts({
    scriptsDir: SCRIPTS_DIR,
    logsDir: LOGS_DIR
  });
  
  // Display summary
  console.log('\n' + '─'.repeat(60));
  console.log('📊 Execution Summary:');
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${failureCount}`);
  console.log(`  📁 Total: ${results.length}`);
  console.log(`  📝 Logs saved to: ${LOGS_DIR}`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

