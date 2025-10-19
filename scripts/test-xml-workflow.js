#!/usr/bin/env node

/**
 * Test XML format workflow
 * 1. Switch to XML
 * 2. Extract
 * 3. Fill
 * 4. Export
 * 5. Validate
 * 6. Switch back to JSON
 */

const { execSync } = require('child_process');

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

console.log('\n' + '='.repeat(60));
console.log('🧪 Testing XML Format Workflow');
console.log('='.repeat(60) + '\n');

try {
  console.log('Step 1: Switch to XML format');
  run('node scripts/switch-to-xml.js');

  console.log('\nStep 2: Extract translations');
  run('npm run i18n:extract');

  console.log('\nStep 3: Fill translations');
  run('npm run i18n:fill');

  console.log('\nStep 4: Export to XLIFF');
  run('npm run i18n:export');

  console.log('\nStep 5: Validate');
  run('npm run i18n:validate');

  console.log('\nStep 6: Switch back to JSON');
  run('node scripts/switch-to-json.js');

  console.log('\n' + '='.repeat(60));
  console.log('✅ XML Format Test PASSED');
  console.log('='.repeat(60) + '\n');
} catch (error) {
  console.error('\n❌ XML Format Test FAILED');
  console.error(error.message);
  process.exit(1);
}
