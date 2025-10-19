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

/**
 * Extract i18n entries with text content from template
 */
export interface I18nEntry {
  key: string;
  text: string;
  type: 'element' | 'attribute';
  attribute?: string;
}

export function extractI18nEntriesFromTemplate(templateContent: string): I18nEntry[] {
  const entries: I18nEntry[] = [];

  // Match element i18n: <tag i18n="@@key">Text</tag>
  const elementPattern = /<([a-zA-Z][\w-]*)[^>]*\si18n="[^"]*@@([^"@\|]+)[^"]*"[^>]*>(.*?)<\/\1>/gs;
  let match;

  while ((match = elementPattern.exec(templateContent)) !== null) {
    const key = match[2].trim();
    let text = match[3].trim();

    // Remove nested tags and clean up
    text = text
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text && key) {
      entries.push({
        key,
        text,
        type: 'element',
      });
    }
  }

  // Match attribute i18n: <tag i18n-placeholder="@@key" placeholder="Text">
  const attrPattern = /<[^>]+i18n-(\w+)="[^"]*@@([^"@\|]+)[^"]*"[^>]*\s\1="([^"]+)"[^>]*>/g;

  while ((match = attrPattern.exec(templateContent)) !== null) {
    const attribute = match[1];
    const key = match[2].trim();
    const text = match[3].trim();

    if (text && key) {
      entries.push({
        key,
        text,
        type: 'attribute',
        attribute,
      });
    }
  }

  return entries;
}

/**
 * Read template file and extract entries with text
 */
export async function getTemplateEntries(templatePath: string): Promise<I18nEntry[]> {
  const content = await fs.promises.readFile(templatePath, 'utf-8');
  return extractI18nEntriesFromTemplate(content);
}
