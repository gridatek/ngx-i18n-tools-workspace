'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.mapKeysToSourceFiles =
  exports.getTemplateKeys =
  exports.extractI18nKeysFromTemplate =
  exports.groupTemplatesByComponent =
  exports.getTranslationFilePath =
  exports.findTemplates =
    void 0;
const tslib_1 = require('tslib');
const glob_1 = require('glob');
const fs = tslib_1.__importStar(require('fs'));
const path = tslib_1.__importStar(require('path'));
/**
 * Find all template files matching pattern
 */
async function findTemplates(pattern, cwd = process.cwd()) {
  const files = await (0, glob_1.glob)(pattern, { cwd, absolute: true });
  return files;
}
exports.findTemplates = findTemplates;
/**
 * Get translation file path for a template
 */
function getTranslationFilePath(templatePath, naming = '{component}.i18n.json') {
  const dir = path.dirname(templatePath);
  const basename = path.basename(templatePath, path.extname(templatePath));
  // Replace {component} with the component name
  const filename = naming.replace('{component}', basename);
  return path.join(dir, filename);
}
exports.getTranslationFilePath = getTranslationFilePath;
async function groupTemplatesByComponent(templates, translationNaming = '{component}.i18n.json') {
  const components = [];
  for (const templatePath of templates) {
    const dir = path.dirname(templatePath);
    const basename = path.basename(templatePath, '.html');
    // Try to find corresponding .ts file
    const tsPath = path.join(dir, `${basename}.ts`);
    const componentPath = fs.existsSync(tsPath) ? tsPath : undefined;
    components.push({
      name: basename,
      templatePath,
      translationPath: getTranslationFilePath(templatePath, translationNaming),
      componentPath,
    });
  }
  return components;
}
exports.groupTemplatesByComponent = groupTemplatesByComponent;
/**
 * Extract i18n keys from template content
 */
function extractI18nKeysFromTemplate(templateContent) {
  const keys = new Set();
  // Match i18n="@@key" pattern
  const i18nPattern = /i18n="[^"]*@@([^"@\|]+)[^"]*"/g;
  let match;
  while ((match = i18nPattern.exec(templateContent)) !== null) {
    keys.add(match[1]);
  }
  // Match i18n-attribute="@@key" pattern
  const i18nAttrPattern = /i18n-\w+="[^"]*@@([^"@\|]+)[^"]*"/g;
  while ((match = i18nAttrPattern.exec(templateContent)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}
exports.extractI18nKeysFromTemplate = extractI18nKeysFromTemplate;
/**
 * Read template file and extract keys
 */
async function getTemplateKeys(templatePath) {
  const content = await fs.promises.readFile(templatePath, 'utf-8');
  return extractI18nKeysFromTemplate(content);
}
exports.getTemplateKeys = getTemplateKeys;
/**
 * Map keys to their source files
 */
async function mapKeysToSourceFiles(templates) {
  const keyToFile = new Map();
  for (const templatePath of templates) {
    const keys = await getTemplateKeys(templatePath);
    for (const key of keys) {
      keyToFile.set(key, templatePath);
    }
  }
  return keyToFile;
}
exports.mapKeysToSourceFiles = mapKeysToSourceFiles;
