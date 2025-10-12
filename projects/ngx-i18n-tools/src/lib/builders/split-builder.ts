import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';
import { TranslationSource } from '../types';
import { parseTranslationXml, buildTranslationXml } from '../converters/xml-parser';
import { findTemplates, getTranslationFilePath, getTemplateKeys } from '../utils/template-scanner';

interface SplitOptions extends JsonObject {
  source: string;
  templatePattern: string;
  translationFileNaming: string;
  outputFormat: 'json' | 'xml';
}

/**
 * Split Builder - Convert merged file to per-component files
 */
export default createBuilder<SplitOptions>(
  async (options: SplitOptions, context: BuilderContext): Promise<BuilderOutput> => {
    try {
      context.logger.info('🔄 Splitting translations by component...');

      // Load merged translation file
      const sourcePath = path.join(context.workspaceRoot, options.source);
      const allTranslations = await loadTranslationFile(sourcePath);

      // Find all templates
      const templates = await findTemplates(options.templatePattern, context.workspaceRoot);

      if (templates.length === 0) {
        context.logger.warn(`No templates found matching pattern: ${options.templatePattern}`);
        return { success: true };
      }

      // For each template, extract keys and create translation file
      for (const templatePath of templates) {
        const keys = await getTemplateKeys(templatePath);

        if (keys.size === 0) {
          context.logger.warn(`No i18n keys found in ${path.relative(context.workspaceRoot, templatePath)}`);
          continue;
        }

        // Extract translations for these keys
        const componentTranslations: TranslationSource = {};

        for (const key of keys) {
          if (allTranslations[key]) {
            componentTranslations[key] = allTranslations[key];
          } else {
            context.logger.warn(`Key '${key}' from template not found in source file`);
          }
        }

        // Write component translation file
        const translationPath = getTranslationFilePath(templatePath, options.translationFileNaming);
        const translationDir = path.dirname(translationPath);
        await fs.promises.mkdir(translationDir, { recursive: true });

        if (options.outputFormat === 'json') {
          await fs.promises.writeFile(translationPath, JSON.stringify(componentTranslations, null, 2), 'utf-8');
        } else {
          const xmlContent = buildTranslationXml(componentTranslations);
          await fs.promises.writeFile(translationPath, xmlContent, 'utf-8');
        }

        context.logger.info(
          `✓ Created: ${path.relative(context.workspaceRoot, translationPath)} (${keys.size} keys)`
        );
      }

      context.logger.info('\n⚠️  Original merged file preserved.');
      context.logger.info('   Delete manually if no longer needed.');

      return { success: true };
    } catch (error: any) {
      context.logger.error(`Split failed: ${error.message}`);
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
