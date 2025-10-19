#!/usr/bin/env node

/**
 * Script to switch demo app to use XML format for translations
 * Updates angular.json configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Switching demo app to XML format...\n');

// Read angular.json
const angularJsonPath = path.join(process.cwd(), 'angular.json');
const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

// Update extract-i18n configuration
const extractConfig = angularJson.projects['demo-app'].architect['extract-i18n'];
extractConfig.options.translationFileNaming = '{component}.i18n.xml';
extractConfig.options.outputFormat = 'xml';

// Write back
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2) + '\n', 'utf8');

console.log('✅ Updated angular.json:');
console.log('   - translationFileNaming: {component}.i18n.xml');
console.log('   - outputFormat: xml\n');
console.log('You can now run:');
console.log('   npm run i18n:extract');
console.log('   npm run i18n:fill');
console.log('   npm run i18n:export\n');
