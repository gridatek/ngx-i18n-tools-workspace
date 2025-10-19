#!/usr/bin/env node

/**
 * Script to switch demo app back to JSON format for translations
 * Updates angular.json configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Switching demo app to JSON format...\n');

// Read angular.json
const angularJsonPath = path.join(process.cwd(), 'angular.json');
const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

// Update extract-i18n configuration
const extractConfig = angularJson.projects['demo-app'].architect['extract-i18n'];
extractConfig.options.translationFileNaming = '{component}.i18n.json';
extractConfig.options.outputFormat = 'json';

// Write back
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2) + '\n', 'utf8');

console.log('✅ Updated angular.json:');
console.log('   - translationFileNaming: {component}.i18n.json');
console.log('   - outputFormat: json\n');
console.log('You can now run:');
console.log('   npm run i18n:extract');
console.log('   npm run i18n:fill');
console.log('   npm run i18n:export\n');
