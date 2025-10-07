#!/usr/bin/env node

/**
 * Test Incompatible Node.js Version Simulation
 * 
 * This script simulates how the library would behave with different Node.js versions
 * by temporarily modifying the process.version for testing purposes.
 */

// Mock process.version for testing
const originalVersion = process.version;

function simulateVersion(version) {
  console.log(`\n🧪 Simulating Node.js ${version}...`);
  console.log('=' .repeat(50));
  
  // Temporarily override process.version
  Object.defineProperty(process, 'version', {
    value: version,
    writable: false,
    configurable: true
  });
  
  try {
    // Try to import the library (this will trigger compatibility check)
    const { CurlRunner } = await import('./src/index.js');
    console.log('✅ Library imported successfully');
    
    // Test basic functionality
    const runner = new CurlRunner();
    console.log('✅ CurlRunner created successfully');
    
  } catch (error) {
    console.log('❌ Library import failed:');
    console.log(error.message);
  } finally {
    // Restore original version
    Object.defineProperty(process, 'version', {
      value: originalVersion,
      writable: false,
      configurable: true
    });
  }
}

async function testIncompatibleVersions() {
  console.log('🚀 Testing Incompatible Node.js Versions');
  console.log('Current Node.js version:', originalVersion);
  console.log('');

  // Test various versions
  const testVersions = [
    'v16.20.0',  // Below minimum
    'v17.9.0',   // Below minimum
    'v18.0.0',   // Minimum supported
    'v20.15.0',  // Supported but not recommended
    'v21.6.0',   // Supported but not recommended
    'v22.18.0',  // Current (recommended and tested)
    'v23.0.0',   // Future version (should work)
    'v24.0.0',   // Future version (should work)
    'v25.0.0'    // Future version (should work but warn)
  ];

  for (const version of testVersions) {
    await simulateVersion(version);
  }

  console.log('\n🎉 Incompatible version testing completed!');
  console.log('\n📋 Summary:');
  console.log('   - Versions below v18.0.0: Should fail with clear error');
  console.log('   - Versions v18.0.0-v21.x.x: Should work with warnings');
  console.log('   - Versions v22.0.0-v24.x.x: Should work perfectly');
  console.log('   - Versions above v24.x.x: Should work with warnings');
}

// Run the test
testIncompatibleVersions().catch(console.error);