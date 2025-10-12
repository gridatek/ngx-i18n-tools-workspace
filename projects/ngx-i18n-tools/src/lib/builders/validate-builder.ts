import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { TranslationSource } from '../types';
import { validateTranslations, validateDuplicateKeys, calculateCoverage } from '../utils/validator';
import { parseTranslationXml } from '../converters/xml-parser';

interface ValidateOptions extends JsonObject {
  source?: string;
  translationPattern?: string;
  sourceLocale: string;
  targetLocales: string[];
}

/**
 * Validate Builder - Comprehensive translation validation
 */
export default createBuilder<ValidateOptions>(
  async (options: ValidateOptions, context: BuilderContext): Promise<BuilderOutput> => {
    try {
      context.logger.info('🔍 Validating translations...\n');

      // Collect all translation files
      const files = new Map<string, TranslationSource>();

      if (options.source) {
        const sourcePath = path.join(context.workspaceRoot, options.source);
        const translations = await loadTranslationFile(sourcePath);
        files.set(sourcePath, translations);
      } else if (options.translationPattern) {
        const filePaths = await glob(options.translationPattern, {
          cwd: context.workspaceRoot,
          absolute: true
        });

        for (const filePath of filePaths) {
          const translations = await loadTranslationFile(filePath);
          files.set(filePath, translations);
        }
      } else {
        return {
          success: false,
          error: 'Either "source" or "translationPattern" must be specified'
        };
      }

      if (files.size === 0) {
        context.logger.warn('No translation files found');
        return { success: true };
      }

      // Merge all translations for validation
      const allTranslations: TranslationSource = {};
      for (const translations of files.values()) {
        Object.assign(allTranslations, translations);
      }

      // Run validations
      const validation = validateTranslations(
        allTranslations,
        options.targetLocales,
        options.sourceLocale
      );

      const duplicateErrors = validateDuplicateKeys(files);

      const coverage = calculateCoverage(allTranslations, options.targetLocales);

      // Report results
      let hasErrors = false;

      if (validation.errors.length === 0 && duplicateErrors.length === 0) {
        context.logger.info('✓ All validations passed');
      } else {
        hasErrors = true;
      }

      if (duplicateErrors.length > 0) {
        context.logger.error('\n❌ Duplicate Keys:');
        for (const error of duplicateErrors) {
          context.logger.error(`  - ${error.key}: ${error.message}`);
        }
      }

      if (validation.errors.length > 0) {
        context.logger.error('\n❌ Validation Errors:');
        for (const error of validation.errors) {
          context.logger.error(`  - [${error.type}] ${error.key}: ${error.message}`);
        }
      }

      if (validation.warnings.length > 0) {
        context.logger.warn('\n⚠️  Warnings:');
        for (const warning of validation.warnings) {
          context.logger.warn(`  - [${warning.type}] ${warning.key}: ${warning.message}`);
        }
      }

      // Report coverage
      context.logger.info('\n📊 Translation Coverage:');
      context.logger.info(`Overall: ${coverage.coveragePercentage}% (${coverage.completeTranslations}/${coverage.totalTranslations})`);
      context.logger.info('\nBy Language:');

      for (const [locale, stats] of coverage.byLanguage.entries()) {
        const icon = stats.percentage === 100 ? '✓' : '⚠️';
        context.logger.info(`  ${icon} ${locale}: ${stats.percentage}% (${stats.complete}/${coverage.totalKeys})`);
      }

      if (hasErrors) {
        return {
          success: false,
          error: `Validation failed with ${validation.errors.length + duplicateErrors.length} errors`
        };
      }

      return { success: true };
    } catch (error: any) {
      context.logger.error(`Validation failed: ${error.message}`);
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
