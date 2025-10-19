/**
 * Unit tests for switch-to-xml.js and switch-to-json.js scripts
 */

const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_DIR = path.join(__dirname, 'temp-test-switch');
const ANGULAR_JSON_BACKUP = path.join(__dirname, '..', 'angular.json.backup');

describe('switch-format scripts', () => {
  let originalAngularJson;

  before(() => {
    // Backup angular.json
    const angularJsonPath = path.join(__dirname, '..', 'angular.json');
    originalAngularJson = fs.readFileSync(angularJsonPath, 'utf8');
  });

  after(() => {
    // Restore angular.json
    const angularJsonPath = path.join(__dirname, '..', 'angular.json');
    fs.writeFileSync(angularJsonPath, originalAngularJson, 'utf8');
  });

  describe('switch-to-xml.js', () => {
    it('should update angular.json to use XML format', () => {
      const scriptPath = path.join(__dirname, '..', 'scripts', 'switch-to-xml.js');
      execSync(`node ${scriptPath}`, { stdio: 'pipe' });

      const angularJsonPath = path.join(__dirname, '..', 'angular.json');
      const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

      const extractConfig = angularJson.projects['demo-app'].architect['extract-i18n'];

      assert.strictEqual(extractConfig.options.translationFileNaming, '{component}.i18n.xml');
      assert.strictEqual(extractConfig.options.outputFormat, 'xml');
    });

    it('should preserve other configuration options', () => {
      const scriptPath = path.join(__dirname, '..', 'scripts', 'switch-to-xml.js');
      execSync(`node ${scriptPath}`, { stdio: 'pipe' });

      const angularJsonPath = path.join(__dirname, '..', 'angular.json');
      const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

      const extractConfig = angularJson.projects['demo-app'].architect['extract-i18n'];

      // Verify other options are preserved
      assert.ok(extractConfig.options.sourceLocale);
      assert.ok(extractConfig.options.targetLocales);
      assert.ok(extractConfig.options.templatePattern);
    });

    it('should output success message', () => {
      const scriptPath = path.join(__dirname, '..', 'scripts', 'switch-to-xml.js');
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

      assert.ok(output.includes('Switching demo app to XML format'));
      assert.ok(output.includes('{component}.i18n.xml'));
      assert.ok(output.includes('outputFormat: xml'));
    });
  });

  describe('switch-to-json.js', () => {
    beforeEach(() => {
      // First switch to XML
      const switchXmlPath = path.join(__dirname, '..', 'scripts', 'switch-to-xml.js');
      execSync(`node ${switchXmlPath}`, { stdio: 'pipe' });
    });

    it('should update angular.json to use JSON format', () => {
      const scriptPath = path.join(__dirname, '..', 'scripts', 'switch-to-json.js');
      execSync(`node ${scriptPath}`, { stdio: 'pipe' });

      const angularJsonPath = path.join(__dirname, '..', 'angular.json');
      const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

      const extractConfig = angularJson.projects['demo-app'].architect['extract-i18n'];

      assert.strictEqual(extractConfig.options.translationFileNaming, '{component}.i18n.json');
      assert.strictEqual(extractConfig.options.outputFormat, 'json');
    });

    it('should preserve other configuration options', () => {
      const scriptPath = path.join(__dirname, '..', 'scripts', 'switch-to-json.js');
      execSync(`node ${scriptPath}`, { stdio: 'pipe' });

      const angularJsonPath = path.join(__dirname, '..', 'angular.json');
      const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

      const extractConfig = angularJson.projects['demo-app'].architect['extract-i18n'];

      // Verify other options are preserved
      assert.ok(extractConfig.options.sourceLocale);
      assert.ok(extractConfig.options.targetLocales);
      assert.ok(extractConfig.options.templatePattern);
    });

    it('should output success message', () => {
      const scriptPath = path.join(__dirname, '..', 'scripts', 'switch-to-json.js');
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

      assert.ok(output.includes('Switching demo app to JSON format'));
      assert.ok(output.includes('{component}.i18n.json'));
      assert.ok(output.includes('outputFormat: json'));
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain configuration integrity through XML -> JSON -> XML', () => {
      const angularJsonPath = path.join(__dirname, '..', 'angular.json');

      // Get original state
      const original = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

      // Switch to XML
      const switchXmlPath = path.join(__dirname, '..', 'scripts', 'switch-to-xml.js');
      execSync(`node ${switchXmlPath}`, { stdio: 'pipe' });

      const afterXml = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
      assert.strictEqual(
        afterXml.projects['demo-app'].architect['extract-i18n'].options.outputFormat,
        'xml',
      );

      // Switch to JSON
      const switchJsonPath = path.join(__dirname, '..', 'scripts', 'switch-to-json.js');
      execSync(`node ${switchJsonPath}`, { stdio: 'pipe' });

      const afterJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
      assert.strictEqual(
        afterJson.projects['demo-app'].architect['extract-i18n'].options.outputFormat,
        'json',
      );

      // Switch back to XML
      execSync(`node ${switchXmlPath}`, { stdio: 'pipe' });

      const final = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
      assert.strictEqual(
        final.projects['demo-app'].architect['extract-i18n'].options.outputFormat,
        'xml',
      );

      // Verify structure is intact
      assert.deepStrictEqual(
        Object.keys(original.projects['demo-app'].architect),
        Object.keys(final.projects['demo-app'].architect),
      );
    });
  });
});
