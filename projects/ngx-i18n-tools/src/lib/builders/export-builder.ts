import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { ExportOptions, TranslationSource } from '../types';
import { jsonToXliff } from '../converters/json-to-xliff.converter';
import { parseTranslationXml } from '../converters/xml-parser';
import { validateTranslations } from '../utils/validator';

/**
 * Export Builder - Converts all-in-one format to XLIFF files for Angular
 */
export default createBuilder<ExportOptions>(
  async (options: ExportOptions, context: BuilderContext): Promise<BuilderOutput> => {
    try {
      context.logger.info('🔄 Exporting translations...');

      // Step 1: Collect all translation files
      let allTranslations: TranslationSource;

      if (options.source) {
        // Merged mode: single file
        allTranslations = await loadTranslationFile(
          path.join(context.workspaceRoot, options.source),
          context
        );
        context.logger.info(`✓ Loaded ${Object.keys(allTranslations).length} keys from ${options.source}`);
      } else if (options.translationPattern) {
        // Per-component mode: scan and merge
        const files = await findTranslationFiles(options.translationPattern, context.workspaceRoot);

        if (files.length === 0) {
          context.logger.warn(`No translation files found matching pattern: ${options.translationPattern}`);
          return { success: true };
        }

        allTranslations = await mergeAllTranslationFiles(files, context);
        context.logger.info(`✓ Collected ${Object.keys(allTranslations).length} keys from ${files.length} files`);
      } else {
        return {
          success: false,
          error: 'Either "source" or "translationPattern" must be specified'
        };
      }

      // Step 2: Validate translations
      const validation = validateTranslations(
        allTranslations,
        options.targetLocales,
        options.sourceLocale
      );

      if (validation.errors.length > 0) {
        context.logger.error('❌ Validation errors:');
        for (const error of validation.errors) {
          context.logger.error(`  - ${error.key}: ${error.message}`);
        }
        return { success: false, error: 'Validation failed' };
      }

      if (validation.warnings.length > 0) {
        context.logger.warn('⚠️  Validation warnings:');
        for (const warning of validation.warnings) {
          context.logger.warn(`  - ${warning.key}: ${warning.message}`);
        }
      }

      // Step 3: Generate XLIFF files per language
      const outputPath = path.join(context.workspaceRoot, options.outputPath);
      await fs.promises.mkdir(outputPath, { recursive: true });

      // Generate source locale XLIFF
      const sourceXliff = jsonToXliff(
        allTranslations,
        options.sourceLocale,
        undefined,
        options.format
      );

      const sourceFileName = `messages.${options.sourceLocale}.xlf`;
      const sourceFilePath = path.join(outputPath, sourceFileName);
      await fs.promises.writeFile(sourceFilePath, sourceXliff, 'utf-8');
      context.logger.info(`✓ Generated: ${path.relative(context.workspaceRoot, sourceFilePath)}`);

      // Generate target locale XLIFFs
      for (const targetLocale of options.targetLocales) {
        const targetXliff = jsonToXliff(
          allTranslations,
          options.sourceLocale,
          targetLocale,
          options.format
        );

        const targetFileName = `messages.${targetLocale}.xlf`;
        const targetFilePath = path.join(outputPath, targetFileName);
        await fs.promises.writeFile(targetFilePath, targetXliff, 'utf-8');

        // Calculate completeness
        const completeness = calculateCompleteness(allTranslations, targetLocale);
        const status = completeness === 100 ? '✓' : '⚠️';
        context.logger.info(
          `${status} Generated: ${path.relative(context.workspaceRoot, targetFilePath)} (${completeness}% complete)`
        );
      }

      return { success: true };
    } catch (error: any) {
      context.logger.error(`Export failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
);

/**
 * Find all translation files matching pattern
 */
async function findTranslationFiles(pattern: string, cwd: string): Promise<string[]> {
  const files = await glob(pattern, { cwd, absolute: true });
  return files;
}

/**
 * Load a single translation file (JSON or XML)
 */
async function loadTranslationFile(
  filePath: string,
  context: BuilderContext
): Promise<TranslationSource> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    return JSON.parse(content);
  } else if (ext === '.xml') {
    return parseTranslationXml(content);
  } else {
    throw new Error(`Unsupported file format: ${ext}`);
  }
}

/**
 * Merge all translation files into one
 */
async function mergeAllTranslationFiles(
  files: string[],
  context: BuilderContext
): Promise<TranslationSource> {
  const merged: TranslationSource = {};

  for (const filePath of files) {
    const translations = await loadTranslationFile(filePath, context);

    for (const [key, langs] of Object.entries(translations)) {
      if (merged[key]) {
        // Key already exists - merge language translations
        merged[key] = { ...merged[key], ...langs };
      } else {
        merged[key] = { ...langs };
      }
    }
  }

  return merged;
}

/**
 * Calculate completeness percentage for a locale
 */
function calculateCompleteness(translations: TranslationSource, locale: string): number {
  const totalKeys = Object.keys(translations).length;
  if (totalKeys === 0) return 100;

  let completeKeys = 0;

  for (const langs of Object.values(translations)) {
    if (langs[locale] && langs[locale].trim() !== '') {
      completeKeys++;
    }
  }

  return Math.round((completeKeys / totalKeys) * 100);
}
