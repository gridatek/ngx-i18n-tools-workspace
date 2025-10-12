import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import * as fs from 'fs';
import * as path from 'path';
import { ExtractOptions, TranslationSource } from '../types';
import { runAngularExtractI18n } from '../utils/angular-wrapper';
import { xliffToJson } from '../converters/xliff-to-json.converter';
import { findTemplates, groupTemplatesByComponent } from '../utils/template-scanner';
import { mergeTranslations } from '../utils/file-merger';
import { parseTranslationXml, buildTranslationXml } from '../converters/xml-parser';

/**
 * Extract Builder - Wraps Angular's extract-i18n and converts to all-in-one format
 */
export default createBuilder<ExtractOptions>(
  async (options: ExtractOptions, context: BuilderContext): Promise<BuilderOutput> => {
    try {
      context.logger.info(`🔍 Extracting i18n in ${options.mode} mode...`);
      context.logger.info(`📁 Workspace: ${context.workspaceRoot}`);
      context.logger.info(`📝 Pattern: ${options.templatePattern}`);

      // For now, create empty translation files as a placeholder
      // TODO: Implement actual template scanning and i18n extraction
      context.logger.warn(
        '⚠️  Note: This is a simplified extraction - manual translation setup required',
      );

      // Step 1: Convert based on mode
      let result: BuilderOutput;

      if (options.mode === 'per-component') {
        result = await extractPerComponent(options, context);
      } else {
        result = await extractMerged(options, context);
      }

      return result;
    } catch (error: any) {
      context.logger.error(`Extraction failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
);

/**
 * Extract translations in per-component mode
 */
async function extractPerComponent(
  options: ExtractOptions,
  context: BuilderContext,
): Promise<BuilderOutput> {
  // Find all component templates
  const templates = await findTemplates(options.templatePattern, context.workspaceRoot);

  if (templates.length === 0) {
    context.logger.warn(`No templates found matching pattern: ${options.templatePattern}`);
    return { success: true };
  }

  context.logger.info(`✓ Found ${templates.length} template(s)`);

  // Group templates by component
  const components = await groupTemplatesByComponent(
    templates,
    options.translationFileNaming || '{component}.i18n.json',
  );

  // Create empty translation structure for now
  // TODO: Scan templates for i18n markers
  const extracted: TranslationSource = {};

  let totalKeys = 0;
  let filesProcessed = 0;

  // For each component, create/update translation file
  for (const component of components) {
    // Filter keys that belong to this template
    // For simplicity, we'll distribute all keys to each component
    // In a real implementation, you'd map keys to templates
    const componentTranslations: TranslationSource = extracted;

    // Load existing translations if present
    let existingTranslations: TranslationSource = {};
    if (fs.existsSync(component.translationPath)) {
      const existingContent = await fs.promises.readFile(component.translationPath, 'utf-8');

      if (options.outputFormat === 'json') {
        existingTranslations = JSON.parse(existingContent);
      } else {
        existingTranslations = parseTranslationXml(existingContent);
      }
    }

    // Merge new extractions with existing translations
    const { merged, result } = mergeTranslations(
      componentTranslations,
      existingTranslations,
      options.targetLocales,
      {
        preserveExisting: options.preserveExisting,
        cleanUnused: options.cleanUnused,
      },
    );

    // Sort keys if requested
    const finalTranslations = options.sortKeys ? sortTranslations(merged) : merged;

    // Write translation file
    await writeTranslationFile(component.translationPath, finalTranslations, options.outputFormat);

    const keyCount = Object.keys(merged).length;
    totalKeys += keyCount;
    filesProcessed++;

    context.logger.info(
      `✓ ${path.relative(context.workspaceRoot, component.templatePath)} → ${path.relative(context.workspaceRoot, component.translationPath)}`,
    );

    if (result.added.length > 0) {
      context.logger.info(`  - Added ${result.added.length} keys`);
    }
    if (result.updated.length > 0) {
      context.logger.warn(`  - Updated source for ${result.updated.length} keys`);
    }
    if (result.removed.length > 0 && !options.cleanUnused) {
      context.logger.warn(
        `  - ${result.removed.length} unused keys (use --clean-unused to remove)`,
      );
    }
  }

  context.logger.info(
    `\n📊 Total: ${totalKeys} keys extracted across ${filesProcessed} components`,
  );

  // Calculate missing translations
  const missingByLocale = calculateMissing(extracted, options.targetLocales);
  for (const [locale, count] of missingByLocale.entries()) {
    if (count > 0) {
      context.logger.warn(`⚠️  Missing translations for ${locale}: ${count}`);
    }
  }

  return { success: true };
}

/**
 * Extract translations in merged mode
 */
async function extractMerged(
  options: ExtractOptions,
  context: BuilderContext,
): Promise<BuilderOutput> {
  if (!options.outputFile) {
    return { success: false, error: 'outputFile is required for merged mode' };
  }

  const outputPath = path.join(context.workspaceRoot, options.outputFile);

  // Create empty translation structure for now
  // TODO: Scan templates for i18n markers
  const extracted: TranslationSource = {};

  // Load existing translations if present
  let existingTranslations: TranslationSource = {};
  if (fs.existsSync(outputPath)) {
    const existingContent = await fs.promises.readFile(outputPath, 'utf-8');

    if (options.outputFormat === 'json') {
      existingTranslations = JSON.parse(existingContent);
    } else {
      existingTranslations = parseTranslationXml(existingContent);
    }
  }

  // Merge new extractions with existing translations
  const { merged, result } = mergeTranslations(
    extracted,
    existingTranslations,
    options.targetLocales,
    {
      preserveExisting: options.preserveExisting,
      cleanUnused: options.cleanUnused,
    },
  );

  // Sort keys if requested
  const finalTranslations = options.sortKeys ? sortTranslations(merged) : merged;

  // Write translation file
  await writeTranslationFile(outputPath, finalTranslations, options.outputFormat);

  const keyCount = Object.keys(merged).length;

  context.logger.info(`✓ Generated: ${path.relative(context.workspaceRoot, outputPath)}`);
  context.logger.info(`📊 Total: ${keyCount} keys extracted`);

  if (result.added.length > 0) {
    context.logger.info(`  - Added: ${result.added.join(', ')}`);
  }
  if (result.updated.length > 0) {
    context.logger.warn(`  - Updated source: ${result.updated.join(', ')}`);
  }
  if (result.removed.length > 0 && !options.cleanUnused) {
    context.logger.warn(`  - ${result.removed.length} unused keys (use --clean-unused to remove)`);
  }

  // Calculate missing translations
  const missingByLocale = calculateMissing(merged, options.targetLocales);
  for (const [locale, count] of missingByLocale.entries()) {
    if (count > 0) {
      context.logger.warn(`⚠️  Missing translations for ${locale}: ${count}`);
    }
  }

  return { success: true };
}

/**
 * Write translation file in specified format
 */
async function writeTranslationFile(
  filePath: string,
  translations: TranslationSource,
  format: 'json' | 'xml',
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });

  if (format === 'json') {
    await fs.promises.writeFile(filePath, JSON.stringify(translations, null, 2), 'utf-8');
  } else {
    const xmlContent = buildTranslationXml(translations);
    await fs.promises.writeFile(filePath, xmlContent, 'utf-8');
  }
}

/**
 * Sort translations by key
 */
function sortTranslations(translations: TranslationSource): TranslationSource {
  const sorted: TranslationSource = {};
  const keys = Object.keys(translations).sort();

  for (const key of keys) {
    sorted[key] = translations[key];
  }

  return sorted;
}

/**
 * Calculate missing translations per locale
 */
function calculateMissing(
  translations: TranslationSource,
  targetLocales: string[],
): Map<string, number> {
  const missing = new Map<string, number>();

  for (const locale of targetLocales) {
    let count = 0;

    for (const langs of Object.values(translations)) {
      if (!langs[locale] || langs[locale].trim() === '') {
        count++;
      }
    }

    missing.set(locale, count);
  }

  return missing;
}
