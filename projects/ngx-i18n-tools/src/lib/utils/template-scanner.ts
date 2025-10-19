import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Find all template files matching pattern
 */
export async function findTemplates(
  pattern: string,
  cwd: string = process.cwd(),
): Promise<string[]> {
  const files = await glob(pattern, { cwd, absolute: true });
  return files;
}

/**
 * Get translation file path for a template
 */
export function getTranslationFilePath(
  templatePath: string,
  naming: string = '{component}.i18n.json',
): string {
  const dir = path.dirname(templatePath);
  const basename = path.basename(templatePath, path.extname(templatePath));

  // Replace {component} with the component name
  const filename = naming.replace('{component}', basename);

  return path.join(dir, filename);
}

/**
 * Group templates by component
 */
export interface ComponentInfo {
  name: string;
  templatePath: string;
  translationPath: string;
  componentPath?: string;
}

export async function groupTemplatesByComponent(
  templates: string[],
  translationNaming: string = '{component}.i18n.json',
): Promise<ComponentInfo[]> {
  const components: ComponentInfo[] = [];

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

/**
 * Extract i18n keys from template content
 */
export function extractI18nKeysFromTemplate(templateContent: string): Set<string> {
  const keys = new Set<string>();

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

/**
 * Read template file and extract keys
 */
export async function getTemplateKeys(templatePath: string): Promise<Set<string>> {
  const content = await fs.promises.readFile(templatePath, 'utf-8');
  return extractI18nKeysFromTemplate(content);
}

/**
 * Map keys to their source files
 */
export async function mapKeysToSourceFiles(templates: string[]): Promise<Map<string, string>> {
  const keyToFile = new Map<string, string>();

  for (const templatePath of templates) {
    const keys = await getTemplateKeys(templatePath);

    for (const key of keys) {
      keyToFile.set(key, templatePath);
    }
  }

  return keyToFile;
}
