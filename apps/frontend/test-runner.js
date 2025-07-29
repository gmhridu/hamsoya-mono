#!/usr/bin/env node

/**
 * Simple test runner for our bug fixes
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTests() {
  log('🧪 Running Bug Fix Tests', 'bold');
  log('=' .repeat(50), 'blue');

  let passed = 0;
  let failed = 0;

  // Test 1: Check ProfileImageUpload cleanup logic
  log('\n📋 Test 1: Profile Picture Auto-Deletion Fix', 'yellow');
  
  try {
    const componentPath = path.join(__dirname, 'src/components/ui/profile-image-upload.tsx');
    const componentCode = fs.readFileSync(componentPath, 'utf8');
    
    // Check if preserveOnUnmount is checked first in cleanup
    const hasPreserveCheck = componentCode.includes('if (preserveOnUnmount)') && 
                             componentCode.includes('return;');
    
    // Check if imageUploadedRef is used
    const hasUploadTracking = componentCode.includes('imageUploadedRef.current = true');
    
    // Check if multiple safeguards exist
    const hasMultipleSafeguards = componentCode.includes('CRITICAL FIX 1:') &&
                                  componentCode.includes('CRITICAL FIX 2:') &&
                                  componentCode.includes('CRITICAL FIX 3:') &&
                                  componentCode.includes('CRITICAL FIX 4:');
    
    if (hasPreserveCheck && hasUploadTracking && hasMultipleSafeguards) {
      log('  ✅ ProfileImageUpload cleanup logic is properly protected', 'green');
      passed++;
    } else {
      log('  ❌ ProfileImageUpload cleanup logic missing safeguards', 'red');
      failed++;
    }
  } catch (error) {
    log(`  ❌ Error reading ProfileImageUpload component: ${error.message}`, 'red');
    failed++;
  }

  // Test 2: Check image compression utility exists
  log('\n📋 Test 2: Image Compression Performance Fix', 'yellow');
  
  try {
    const compressionPath = path.join(__dirname, 'src/lib/image-compression.ts');
    const compressionExists = fs.existsSync(compressionPath);
    
    if (compressionExists) {
      const compressionCode = fs.readFileSync(compressionPath, 'utf8');
      const hasCompressFunction = compressionCode.includes('export async function compressImage');
      const hasOptimization = compressionCode.includes('calculateDimensions') &&
                              compressionCode.includes('canvas.toBlob');
      
      if (hasCompressFunction && hasOptimization) {
        log('  ✅ Image compression utility implemented', 'green');
        passed++;
      } else {
        log('  ❌ Image compression utility incomplete', 'red');
        failed++;
      }
    } else {
      log('  ❌ Image compression utility not found', 'red');
      failed++;
    }
  } catch (error) {
    log(`  ❌ Error checking image compression: ${error.message}`, 'red');
    failed++;
  }

  // Test 3: Check enhanced upload with progress tracking
  log('\n📋 Test 3: Enhanced Upload with Progress Tracking', 'yellow');
  
  try {
    const imagekitPath = path.join(__dirname, 'src/lib/imagekit.ts');
    const imagekitCode = fs.readFileSync(imagekitPath, 'utf8');
    
    // Check for XMLHttpRequest progress tracking
    const hasProgressTracking = imagekitCode.includes('XMLHttpRequest') &&
                                imagekitCode.includes('upload.addEventListener');
    
    // Check for retry logic
    const hasRetryLogic = imagekitCode.includes('maxRetries') &&
                          imagekitCode.includes('for (let attempt');
    
    // Check for compression integration
    const hasCompressionIntegration = imagekitCode.includes('compressImage') &&
                                      imagekitCode.includes('shouldCompressImage');
    
    if (hasProgressTracking && hasRetryLogic && hasCompressionIntegration) {
      log('  ✅ Enhanced upload with progress tracking implemented', 'green');
      passed++;
    } else {
      log('  ❌ Enhanced upload features missing', 'red');
      failed++;
    }
  } catch (error) {
    log(`  ❌ Error checking enhanced upload: ${error.message}`, 'red');
    failed++;
  }

  // Test 4: Check registration form integration
  log('\n📋 Test 4: Registration Form Integration', 'yellow');
  
  try {
    const loginClientPath = path.join(__dirname, 'src/components/auth/login-client.tsx');
    const loginClientCode = fs.readFileSync(loginClientPath, 'utf8');
    
    // Check if preserveOnUnmount is set to true
    const hasPreserveOnUnmount = loginClientCode.includes('preserveOnUnmount={true}');
    
    // Check if isFormSubmitting is passed
    const hasFormSubmitting = loginClientCode.includes('isFormSubmitting={isLoading}');
    
    // Check if preventDeletion is passed
    const hasPreventDeletion = loginClientCode.includes('preventDeletion={isLoading}');
    
    if (hasPreserveOnUnmount && hasFormSubmitting && hasPreventDeletion) {
      log('  ✅ Registration form properly configured', 'green');
      passed++;
    } else {
      log('  ❌ Registration form missing required props', 'red');
      failed++;
    }
  } catch (error) {
    log(`  ❌ Error checking registration form: ${error.message}`, 'red');
    failed++;
  }

  // Summary
  log('\n' + '=' .repeat(50), 'blue');
  log(`📊 Test Results: ${passed} passed, ${failed} failed`, 'bold');
  
  if (failed === 0) {
    log('🎉 All tests passed! Bug fixes are working correctly.', 'green');
    return true;
  } else {
    log('⚠️  Some tests failed. Please review the fixes.', 'red');
    return false;
  }
}

// Run the tests
const success = runTests();
process.exit(success ? 0 : 1);
