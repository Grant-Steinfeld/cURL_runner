#!/usr/bin/env node

/**
 * Test Node.js Version Compatibility Enforcement
 * 
 * This script tests the compatibility enforcement system
 */

import { 
  enforceCompatibility, 
  getCompatibilityInfo, 
  isTestedVersion, 
  isRecommendedVersion, 
  getCompatibilityMatrix 
} from './src/index.js';

function testCompatibilityEnforcement() {
  console.log('🧪 Testing Node.js Version Compatibility Enforcement');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Test 1: Get compatibility info
    console.log('1. Getting compatibility information...');
    const info = getCompatibilityInfo();
    console.log(`   Current Node.js: ${info.currentVersion}`);
    console.log(`   Is Supported: ${info.isSupported ? '✅' : '❌'}`);
    console.log(`   Is Recommended: ${info.isRecommended ? '✅' : '❌'}`);
    console.log(`   Is Tested: ${info.isTested ? '✅' : '❌'}`);
    console.log('');

    // Test 2: Get compatibility matrix
    console.log('2. Getting compatibility matrix...');
    const matrix = getCompatibilityMatrix();
    console.log(`   Minimum: ${matrix.minimum}`);
    console.log(`   Recommended: ${matrix.recommended.min} - ${matrix.recommended.max}`);
    console.log(`   Tested: ${matrix.tested.min} - ${matrix.tested.max}`);
    console.log('');

    // Test 3: Check version status
    console.log('3. Checking version status...');
    console.log(`   Is Tested Version: ${isTestedVersion() ? '✅' : '❌'}`);
    console.log(`   Is Recommended Version: ${isRecommendedVersion() ? '✅' : '❌'}`);
    console.log('');

    // Test 4: Test enforcement (should not throw for supported versions)
    console.log('4. Testing compatibility enforcement...');
    try {
      enforceCompatibility({ strict: false, warn: false });
      console.log('   ✅ Compatibility check passed (no warnings)');
    } catch (error) {
      console.log('   ❌ Compatibility check failed:', error.message);
    }
    console.log('');

    // Test 5: Test enforcement with warnings
    console.log('5. Testing compatibility enforcement with warnings...');
    try {
      enforceCompatibility({ strict: false, warn: true });
      console.log('   ✅ Compatibility check passed (with warnings if applicable)');
    } catch (error) {
      console.log('   ❌ Compatibility check failed:', error.message);
    }
    console.log('');

    // Test 6: Test strict enforcement
    console.log('6. Testing strict compatibility enforcement...');
    try {
      enforceCompatibility({ strict: true, warn: false });
      console.log('   ✅ Strict compatibility check passed');
    } catch (error) {
      console.log('   ⚠️  Strict compatibility check failed (expected for non-tested versions)');
      console.log(`   Error: ${error.message.split('\n')[0]}`);
    }
    console.log('');

    console.log('🎉 Compatibility enforcement test completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Current Node.js: ${info.currentVersion}`);
    console.log(`   Support Status: ${info.isSupported ? 'Supported' : 'Not Supported'}`);
    console.log(`   Recommendation: ${info.isRecommended ? 'Recommended' : 'Not Recommended'}`);
    console.log(`   Test Status: ${info.isTested ? 'Tested' : 'Not Tested'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCompatibilityEnforcement();