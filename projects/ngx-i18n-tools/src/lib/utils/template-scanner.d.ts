/**
 * Find all template files matching pattern
 */
export declare function findTemplates(pattern: string, cwd?: string): Promise<string[]>;
/**
 * Get translation file path for a template
 */
export declare function getTranslationFilePath(templatePath: string, naming?: string): string;
/**
 * Group templates by component
 */
export interface ComponentInfo {
  name: string;
  templatePath: string;
  translationPath: string;
  componentPath?: string;
}
export declare function groupTemplatesByComponent(
  templates: string[],
  translationNaming?: string,
): Promise<ComponentInfo[]>;
/**
 * Extract i18n keys from template content
 */
export declare function extractI18nKeysFromTemplate(templateContent: string): Set<string>;
/**
 * Read template file and extract keys
 */
export declare function getTemplateKeys(templatePath: string): Promise<Set<string>>;
/**
 * Map keys to their source files
 */
export declare function mapKeysToSourceFiles(templates: string[]): Promise<Map<string, string>>;
