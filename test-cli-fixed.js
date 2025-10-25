#!/usr/bin/env node

/**
 * Test script to verify the CLI works correctly
 */

import { parseArgs, showHelp, showVersion, validateArgs } from './src/cli/parser.js';

console.log('🧪 Testing Native CLI Parser\n');

// Test 1: Basic argument parsing
console.log('Test 1: Basic argument parsing');
process.argv = ['node', 'index.js', 'run-parallel', '--dir', './cURL_scripts'];
const parsed1 = parseArgs();
console.log('✅ Parsed:', parsed1);
console.log('');

// Test 2: Help flag
console.log('Test 2: Help flag');
process.argv = ['node', 'index.js', '--help'];
const parsed2 = parseArgs();
console.log('✅ Help flag detected:', parsed2.options.help);
console.log('');

// Test 3: Version flag
console.log('Test 3: Version flag');
process.argv = ['node', 'index.js', '--version'];
const parsed3 = parseArgs();
console.log('✅ Version flag detected:', parsed3.options.version);
console.log('');

// Test 4: Complex command with options
console.log('Test 4: Complex command with options');
process.argv = ['node', 'index.js', 'run-concurrent', '--batch-size', '3', '--delay', '500'];
const parsed4 = parseArgs();
console.log('✅ Complex command parsed:', parsed4);
console.log('');

// Test 5: Validation
console.log('Test 5: Validation');
process.argv = ['node', 'index.js', 'run-script', 'test.sh'];
const parsed5 = parseArgs();
try {
  validateArgs(parsed5);
  console.log('✅ Validation passed');
} catch (error) {
  console.log('❌ Validation failed:', error.message);
}
console.log('');

console.log('🎉 All CLI tests completed!');
