import { TranslationSource, ValidationResult, ValidationError, ValidationWarning } from '../types';
/**
 * Validate translations for completeness and correctness
 */
export declare function validateTranslations(
  translations: TranslationSource,
  targetLocales: string[],
  sourceLocale?: string,
): ValidationResult;
/**
 * Extract interpolation placeholders from text
 */
export declare function extractPlaceholders(text: string): string[];
/**
 * Validate for duplicate keys across multiple translation files
 */
export declare function validateDuplicateKeys(
  files: Map<string, TranslationSource>,
): ValidationError[];
/**
 * Check for unused keys (keys not found in templates)
 */
export declare function findUnusedKeys(
  translations: TranslationSource,
  usedKeys: Set<string>,
): ValidationWarning[];
/**
 * Calculate translation coverage statistics
 */
export interface CoverageStats {
  totalKeys: number;
  totalTranslations: number;
  completeTranslations: number;
  missingTranslations: number;
  coveragePercentage: number;
  byLanguage: Map<
    string,
    {
      complete: number;
      missing: number;
      percentage: number;
    }
  >;
}
export declare function calculateCoverage(
  translations: TranslationSource,
  targetLocales: string[],
): CoverageStats;
