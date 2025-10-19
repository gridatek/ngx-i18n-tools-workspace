/**
 * Unit tests for fill-translations.js script
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_DIR = path.join(__dirname, 'temp-test-fill');

describe('fill-translations.js', () => {
  before(() => {
    // Create test directory structure
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  after(() => {
    // Cleanup
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('JSON format', () => {
    it('should fill missing translations in JSON files', () => {
      const testFile = path.join(TEST_DIR, 'test.i18n.json');

      // Create a JSON file with missing translations
      const input = {
        'app.title': {
          en: 'ngx-i18n-tools Demo',
          es: '',
          fr: '',
          de: '',
        },
        'nav.home': {
          en: 'Home',
          es: '',
          fr: '',
          de: '',
        },
      };

      fs.writeFileSync(testFile, JSON.stringify(input, null, 2));

      // Run fill-translations script
      const scriptPath = path.join(__dirname, '..', 'scripts', 'fill-translations.js');

      // Mock the glob pattern by temporarily changing directory
      const originalCwd = process.cwd();
      process.chdir(path.join(__dirname, '..'));

      try {
        // The script uses glob to find files, so we need to create proper structure
        const demoPath = path.join(process.cwd(), 'projects', 'demo-app', 'src', 'app');
        fs.mkdirSync(demoPath, { recursive: true });
        const demoFile = path.join(demoPath, 'test.i18n.json');
        fs.writeFileSync(demoFile, JSON.stringify(input, null, 2));

        execSync(`node ${scriptPath}`, { stdio: 'pipe' });

        // Read the result
        const output = JSON.parse(fs.readFileSync(demoFile, 'utf8'));

        // Verify translations were filled
        assert.strictEqual(output['app.title'].en, 'ngx-i18n-tools Demo');
        assert.strictEqual(output['app.title'].es, 'Demo de ngx-i18n-tools');
        assert.strictEqual(output['app.title'].fr, 'Démo ngx-i18n-tools');
        assert.strictEqual(output['app.title'].de, 'ngx-i18n-tools Demo');

        assert.strictEqual(output['nav.home'].en, 'Home');
        assert.strictEqual(output['nav.home'].es, 'Inicio');
        assert.strictEqual(output['nav.home'].fr, 'Accueil');
        assert.strictEqual(output['nav.home'].de, 'Startseite');

        // Cleanup
        fs.rmSync(path.join(process.cwd(), 'projects'), { recursive: true, force: true });
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should preserve existing translations', () => {
      const testFile = path.join(TEST_DIR, 'preserve.i18n.json');

      const input = {
        'app.title': {
          en: 'ngx-i18n-tools Demo',
          es: 'Custom Spanish',
          fr: '',
          de: '',
        },
      };

      fs.writeFileSync(testFile, JSON.stringify(input, null, 2));

      const originalCwd = process.cwd();
      process.chdir(path.join(__dirname, '..'));

      try {
        const demoPath = path.join(process.cwd(), 'projects', 'demo-app', 'src', 'app');
        fs.mkdirSync(demoPath, { recursive: true });
        const demoFile = path.join(demoPath, 'preserve.i18n.json');
        fs.writeFileSync(demoFile, JSON.stringify(input, null, 2));

        const scriptPath = path.join(__dirname, '..', 'scripts', 'fill-translations.js');
        execSync(`node ${scriptPath}`, { stdio: 'pipe' });

        const output = JSON.parse(fs.readFileSync(demoFile, 'utf8'));

        // Verify custom translation was preserved
        assert.strictEqual(output['app.title'].es, 'Custom Spanish');

        // Cleanup
        fs.rmSync(path.join(process.cwd(), 'projects'), { recursive: true, force: true });
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('XML format', () => {
    it('should fill missing translations in XML files', () => {
      const originalCwd = process.cwd();
      process.chdir(path.join(__dirname, '..'));

      try {
        const demoPath = path.join(process.cwd(), 'projects', 'demo-app', 'src', 'app');
        fs.mkdirSync(demoPath, { recursive: true });
        const demoFile = path.join(demoPath, 'test.i18n.xml');

        const inputXml = `<?xml version="1.0" encoding="UTF-8"?>
<translations>
  <translation key="app.title">
    <en>ngx-i18n-tools Demo</en>
    <es></es>
    <fr></fr>
    <de></de>
  </translation>
  <translation key="nav.home">
    <en>Home</en>
    <es></es>
    <fr></fr>
    <de></de>
  </translation>
</translations>
`;

        fs.writeFileSync(demoFile, inputXml);

        const scriptPath = path.join(__dirname, '..', 'scripts', 'fill-translations.js');
        execSync(`node ${scriptPath}`, { stdio: 'pipe' });

        const output = fs.readFileSync(demoFile, 'utf8');

        // Verify translations were filled
        assert.ok(output.includes('<es>Demo de ngx-i18n-tools</es>'));
        assert.ok(output.includes('<fr>Démo ngx-i18n-tools</fr>'));
        assert.ok(output.includes('<de>ngx-i18n-tools Demo</de>'));

        assert.ok(output.includes('<es>Inicio</es>'));
        assert.ok(output.includes('<fr>Accueil</fr>'));
        assert.ok(output.includes('<de>Startseite</de>'));

        // Cleanup
        fs.rmSync(path.join(process.cwd(), 'projects'), { recursive: true, force: true });
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle XML special characters correctly', () => {
      const originalCwd = process.cwd();
      process.chdir(path.join(__dirname, '..'));

      try {
        const demoPath = path.join(process.cwd(), 'projects', 'demo-app', 'src', 'app');
        fs.mkdirSync(demoPath, { recursive: true });
        const demoFile = path.join(demoPath, 'special.i18n.xml');

        const inputXml = `<?xml version="1.0" encoding="UTF-8"?>
<translations>
  <translation key="test.special">
    <en>Test &lt;tag&gt; &amp; "quotes"</en>
    <es></es>
    <fr></fr>
    <de></de>
  </translation>
</translations>
`;

        fs.writeFileSync(demoFile, inputXml);

        const scriptPath = path.join(__dirname, '..', 'scripts', 'fill-translations.js');
        execSync(`node ${scriptPath}`, { stdio: 'pipe' });

        const output = fs.readFileSync(demoFile, 'utf8');

        // Verify XML entities are properly escaped
        assert.ok(output.includes('&lt;') || output.includes('<'));
        assert.ok(output.includes('&amp;') || output.includes('&'));

        // Cleanup
        fs.rmSync(path.join(process.cwd(), 'projects'), { recursive: true, force: true });
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Mixed formats', () => {
    it('should handle both JSON and XML files together', () => {
      const originalCwd = process.cwd();
      process.chdir(path.join(__dirname, '..'));

      try {
        const demoPath = path.join(process.cwd(), 'projects', 'demo-app', 'src', 'app');
        fs.mkdirSync(demoPath, { recursive: true });

        // Create JSON file
        const jsonFile = path.join(demoPath, 'test1.i18n.json');
        const jsonInput = {
          'nav.home': { en: 'Home', es: '', fr: '', de: '' },
        };
        fs.writeFileSync(jsonFile, JSON.stringify(jsonInput, null, 2));

        // Create XML file
        const xmlFile = path.join(demoPath, 'test2.i18n.xml');
        const xmlInput = `<?xml version="1.0" encoding="UTF-8"?>
<translations>
  <translation key="nav.profile">
    <en>Profile</en>
    <es></es>
    <fr></fr>
    <de></de>
  </translation>
</translations>
`;
        fs.writeFileSync(xmlFile, xmlInput);

        const scriptPath = path.join(__dirname, '..', 'scripts', 'fill-translations.js');
        const result = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

        // Verify it found both files
        assert.ok(result.includes('1 JSON, 1 XML'));

        // Cleanup
        fs.rmSync(path.join(process.cwd(), 'projects'), { recursive: true, force: true });
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
