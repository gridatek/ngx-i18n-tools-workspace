import { TranslationSource, MergeResult } from '../types';
/**
 * Merge new extractions with existing translations
 * Preserves human translations while updating structure
 */
export declare function mergeTranslations(
  newTranslations: TranslationSource,
  existingTranslations: TranslationSource,
  targetLocales: string[],
  options: {
    preserveExisting: boolean;
    cleanUnused: boolean;
  },
): {
  merged: TranslationSource;
  result: MergeResult;
};
/**
 * Merge multiple translation files into one
 */
export declare function mergeMultipleFiles(
  files: Map<string, TranslationSource>,
): TranslationSource;
/**
 * Sort translation keys alphabetically
 */
export declare function sortTranslationKeys(translations: TranslationSource): TranslationSource;
/**
 * Initialize empty translations for target locales
 */
export declare function initializeTranslations(
  keys: string[],
  sourceLocale: string,
  sourceTexts: Map<string, string>,
  targetLocales: string[],
): TranslationSource;
