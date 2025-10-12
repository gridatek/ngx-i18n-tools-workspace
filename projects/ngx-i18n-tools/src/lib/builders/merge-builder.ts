import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { TranslationSource } from '../types';
import { parseTranslationXml, buildTranslationXml } from '../converters/xml-parser';
import { mergeMultipleFiles } from '../utils/file-merger';

interface MergeOptions extends JsonObject {
  translationPattern: string;
  outputFile: string;
  outputFormat: 'json' | 'xml';
  sortKeys?: boolean;
}

/**
 * Merge Builder - Convert per-component files to merged file
 */
export default createBuilder<MergeOptions>(
  async (options: MergeOptions, context: BuilderContext): Promise<BuilderOutput> => {
    try {
      context.logger.info('🔄 Merging all component translations...');

      // Find all translation files
      const filePaths = await glob(options.translationPattern, {
        cwd: context.workspaceRoot,
        absolute: true
      });

      if (filePaths.length === 0) {
        context.logger.warn(`No translation files found matching pattern: ${options.translationPattern}`);
        return { success: true };
      }

      // Load all files
      const files = new Map<string, TranslationSource>();

      for (const filePath of filePaths) {
        const translations = await loadTranslationFile(filePath);
        files.set(filePath, translations);

        const keyCount = Object.keys(translations).length;
        context.logger.info(`✓ ${path.relative(context.workspaceRoot, filePath)} (${keyCount} keys)`);
      }

      // Merge all translations
      const merged = mergeMultipleFiles(files);
      const totalKeys = Object.keys(merged).length;

      // Sort if requested
      const finalTranslations = options.sortKeys ? sortTranslations(merged) : merged;

      // Write merged file
      const outputPath = path.join(context.workspaceRoot, options.outputFile);
      const outputDir = path.dirname(outputPath);
      await fs.promises.mkdir(outputDir, { recursive: true });

      if (options.outputFormat === 'json') {
        await fs.promises.writeFile(outputPath, JSON.stringify(finalTranslations, null, 2), 'utf-8');
      } else {
        const xmlContent = buildTranslationXml(finalTranslations);
        await fs.promises.writeFile(outputPath, xmlContent, 'utf-8');
      }

      context.logger.info(`\n✓ Created: ${path.relative(context.workspaceRoot, outputPath)} (${totalKeys} keys)`);
      context.logger.info('\n⚠️  Original component files preserved.');
      context.logger.info('   Delete manually if no longer needed.');

      return { success: true };
    } catch (error: any) {
      context.logger.error(`Merge failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
);

async function loadTranslationFile(filePath: string): Promise<TranslationSource> {
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

function sortTranslations(translations: TranslationSource): TranslationSource {
  const sorted: TranslationSource = {};
  const keys = Object.keys(translations).sort();

  for (const key of keys) {
    sorted[key] = translations[key];
  }

  return sorted;
}
