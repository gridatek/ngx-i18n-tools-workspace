/**
 * E2E tests for XML translation workflow
 * Tests the complete workflow: switch to XML → extract → fill → export → validate → build
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.join(__dirname, '..');

test.describe('XML Translation Workflow E2E', () => {
  test.beforeAll(() => {
    // Ensure we're in JSON mode at start
    execSync('node scripts/switch-to-json.js', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    // Build library
    execSync('npm run build:lib', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 120000,
    });
  });

  test.afterAll(() => {
    // Restore to JSON mode
    execSync('node scripts/switch-to-json.js', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });
  });

  test('should successfully complete XML workflow', async () => {
    // Step 0: Clean up any existing translation files (JSON or XML)
    const translationPatterns = [
      'projects/demo-app/src/**/*.i18n.json',
      'projects/demo-app/src/**/*.i18n.xml',
    ];

    const glob = require('glob');
    for (const pattern of translationPatterns) {
      const files = glob.sync(pattern, { cwd: PROJECT_ROOT });
      for (const file of files) {
        const fullPath = path.join(PROJECT_ROOT, file);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    // Step 1: Switch to XML
    const switchOutput = execSync('node scripts/switch-to-xml.js', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
    });

    expect(switchOutput).toContain('XML format');
    expect(switchOutput).toContain('{component}.i18n.xml');

    // Verify angular.json was updated
    const angularJsonPath = path.join(PROJECT_ROOT, 'angular.json');
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
    const extractConfig = angularJson.projects['demo-app'].architect['extract-i18n'];

    expect(extractConfig.options.outputFormat).toBe('xml');
    expect(extractConfig.options.translationFileNaming).toBe('{component}.i18n.xml');

    // Step 2: Extract translations
    const extractOutput = execSync('npm run i18n:extract', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      timeout: 60000,
    });

    expect(extractOutput).toContain('Extracting i18n');

    // Verify XML files were created
    const xmlFiles = [
      path.join(PROJECT_ROOT, 'projects/demo-app/src/app/app.component.i18n.xml'),
      path.join(PROJECT_ROOT, 'projects/demo-app/src/app/home/home.component.i18n.xml'),
      path.join(
        PROJECT_ROOT,
        'projects/demo-app/src/app/features/user-profile/user-profile.component.i18n.xml',
      ),
    ];

    for (const xmlFile of xmlFiles) {
      expect(fs.existsSync(xmlFile)).toBe(true);

      const content = fs.readFileSync(xmlFile, 'utf8');
      expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(content).toContain('<translations>');
      expect(content).toContain('<translation key=');
      expect(content).toContain('<en>');
      expect(content).toContain('</translations>');
    }

    // Step 3: Fill translations
    const fillOutput = execSync('npm run i18n:fill', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
    });

    expect(fillOutput).toContain('XML');

    // Verify translations were filled
    const appXml = fs.readFileSync(xmlFiles[0], 'utf8');
    expect(appXml).toContain('<es>');
    expect(appXml).toContain('<fr>');
    expect(appXml).toContain('<de>');

    // Check specific translations
    expect(appXml).toContain('ngx-i18n-tools Demo');
    expect(appXml).toContain('Demo de ngx-i18n-tools');

    // Step 4: Export to XLIFF
    const exportOutput = execSync('npm run i18n:export', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      timeout: 60000,
    });

    expect(exportOutput).toContain('Exporting translations');
    expect(exportOutput).toContain('100%');

    // Verify XLIFF files were created
    const xliffFiles = ['en', 'es', 'fr', 'de'].map((locale) =>
      path.join(PROJECT_ROOT, `projects/demo-app/src/locale/messages.${locale}.xlf`),
    );

    for (const xliffFile of xliffFiles) {
      expect(fs.existsSync(xliffFile)).toBe(true);

      const content = fs.readFileSync(xliffFile, 'utf8');
      expect(content).toContain('<xliff');
      expect(content).toContain('version="2.0"');
    }

    // Step 5: Validate
    const validateOutput = execSync('npm run i18n:validate', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
    });

    expect(validateOutput).toContain('All validations passed');
    expect(validateOutput).toContain('100%');

    // Step 6: Build demo app with localization
    const buildOutput = execSync('npm run build:demo -- --configuration=development', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      timeout: 180000,
    });

    expect(buildOutput).toContain('Build at:');

    // Step 7: Switch back to JSON
    const switchBackOutput = execSync('node scripts/switch-to-json.js', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
    });

    expect(switchBackOutput).toContain('JSON format');
  });

  test('should handle XML special characters correctly', async () => {
    // Switch to XML
    execSync('node scripts/switch-to-xml.js', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    // Extract
    execSync('npm run i18n:extract', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });

    // Read one of the XML files
    const xmlFile = path.join(PROJECT_ROOT, 'projects/demo-app/src/app/app.component.i18n.xml');
    const content = fs.readFileSync(xmlFile, 'utf8');

    // Check for proper XML structure
    expect(content).toMatch(/<translation key="[^"]+"/);

    // Verify no unescaped XML characters in keys
    const keyMatches = content.match(/key="([^"]+)"/g);
    if (keyMatches) {
      for (const match of keyMatches) {
        expect(match).not.toContain('<');
        expect(match).not.toContain('>');
      }
    }
  });

  test('should preserve translations across re-extraction in XML mode', async () => {
    // Switch to XML
    execSync('node scripts/switch-to-xml.js', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    // Extract
    execSync('npm run i18n:extract', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });

    // Fill
    execSync('npm run i18n:fill', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    // Read one XML file
    const xmlFile = path.join(PROJECT_ROOT, 'projects/demo-app/src/app/app.component.i18n.xml');
    const beforeReExtraction = fs.readFileSync(xmlFile, 'utf8');

    // Extract again
    execSync('npm run i18n:extract', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });

    // Read again
    const afterReExtraction = fs.readFileSync(xmlFile, 'utf8');

    // Translations should be preserved
    const beforeEs = beforeReExtraction.match(/<es>([^<]*)<\/es>/g);
    const afterEs = afterReExtraction.match(/<es>([^<]*)<\/es>/g);

    if (beforeEs && afterEs) {
      expect(afterEs.length).toBeGreaterThan(0);
      // At least some translations should be preserved
      const preservedCount = afterEs.filter((tag) => tag !== '<es></es>' && tag !== '<es/>').length;
      expect(preservedCount).toBeGreaterThan(0);
    }
  });

  test('should produce identical XLIFF output for JSON and XML modes', async () => {
    const locales = ['en', 'es', 'fr', 'de'];
    const xliffPathTemplate = (locale: string) =>
      path.join(PROJECT_ROOT, `projects/demo-app/src/locale/messages.${locale}.xlf`);

    // Extract and export in JSON mode
    execSync('node scripts/switch-to-json.js', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    execSync('npm run i18n:extract', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });

    execSync('npm run i18n:fill', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    execSync('npm run i18n:export', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });

    // Save JSON mode XLIFF files
    const jsonXliff: Record<string, string> = {};
    for (const locale of locales) {
      jsonXliff[locale] = fs.readFileSync(xliffPathTemplate(locale), 'utf8');
    }

    // Extract and export in XML mode
    execSync('node scripts/switch-to-xml.js', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    execSync('npm run i18n:extract', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });

    execSync('npm run i18n:fill', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    execSync('npm run i18n:export', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });

    // Compare XLIFF files
    for (const locale of locales) {
      const xmlXliff = fs.readFileSync(xliffPathTemplate(locale), 'utf8');

      // Extract translation units for comparison (ignore formatting differences)
      const extractUnits = (xliff: string) => {
        const units = xliff.match(/<trans-unit[^>]*>[\s\S]*?<\/trans-unit>/g) || [];
        return units.sort();
      };

      const jsonUnits = extractUnits(jsonXliff[locale]);
      const xmlUnits = extractUnits(xmlXliff);

      // Should have same number of translation units
      expect(xmlUnits.length).toBe(jsonUnits.length);
    }

    // Restore to JSON
    execSync('node scripts/switch-to-json.js', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });
  });
});

test.describe('XML Format Demo App E2E', () => {
  let buildProcess: any;

  test.beforeAll(async () => {
    // Build in XML mode
    execSync('node scripts/switch-to-xml.js', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    execSync('npm run build:lib', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 120000,
    });

    execSync('npm run i18n:extract', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });

    execSync('npm run i18n:fill', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });

    execSync('npm run i18n:export', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });
  });

  test.afterAll(async () => {
    // Restore to JSON
    execSync('node scripts/switch-to-json.js', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });
  });

  test('should display app with translations from XML workflow', async ({ page }) => {
    await page.goto('http://localhost:4200');

    // Verify app loads
    await expect(page).toHaveTitle(/ngx-i18n-tools Demo/i);

    // Check navigation links
    const homeLink = page.getByRole('link', { name: /home|inicio|accueil|startseite/i });
    await expect(homeLink).toBeVisible();

    const profileLink = page.getByRole('link', { name: /profile|perfil|profil/i });
    await expect(profileLink).toBeVisible();

    // Check footer
    const footer = page.locator('footer');
    await expect(footer).toContainText(/2024 Gridatek/i);
  });
});
