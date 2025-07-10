#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running All Tests...\n');

// Run Jest tests (unit tests)
console.log('📋 Running Unit Tests (Jest)...');
try {
  execSync('npx jest test/unit/ --silent', { stdio: 'inherit' });
  console.log('✅ Unit tests passed!\n');
} catch (error) {
  console.log('❌ Unit tests failed!\n');
  process.exit(1);
}

// Run integration tests
console.log('🔗 Running Integration Tests...');
const integrationTests = [
  'test/integration/test-math-issue-case.js'
];

for (const test of integrationTests) {
  console.log(`\n📝 Running: ${test}`);
  try {
    execSync(`node ${test}`, { stdio: 'pipe' });
    console.log(`✅ ${test} passed!`);
  } catch (error) {
    console.log(`❌ ${test} failed!`);
    process.exit(1);
  }
}

// Run feature tests
console.log('\n🎯 Running Feature Tests...');
const featureTests = [
  'test/features/test-math-rendering.js',
  'test/features/test-nested-numbered-lists.js',
  'test/features/test-mdx-spacing.js'
];

for (const test of featureTests) {
  console.log(`\n📝 Running: ${test}`);
  try {
    execSync(`node ${test}`, { stdio: 'pipe' });
    console.log(`✅ ${test} passed!`);
  } catch (error) {
    console.log(`❌ ${test} failed!`);
    process.exit(1);
  }
}

console.log('\n🎉 All tests completed successfully!'); 