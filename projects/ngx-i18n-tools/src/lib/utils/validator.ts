import { TranslationSource, ValidationResult, ValidationError, ValidationWarning } from '../types';

/**
 * Validate translations for completeness and correctness
 */
export function validateTranslations(
  translations: TranslationSource,
  targetLocales: string[],
  sourceLocale: string = 'en',
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const [key, langs] of Object.entries(translations)) {
    // Check source locale exists
    if (!langs[sourceLocale]) {
      errors.push({
        type: 'missing_language',
        key,
        message: `Missing source language '${sourceLocale}'`,
        file: '',
      });
      continue;
    }

    const sourceText = langs[sourceLocale];
    const sourcePlaceholders = extractPlaceholders(sourceText);

    // Check each target locale
    for (const locale of targetLocales) {
      const targetText = langs[locale];

      // Check for missing translations
      if (!targetText || targetText.trim() === '') {
        warnings.push({
          type: 'incomplete_translation',
          key,
          message: `Missing translation for locale '${locale}'`,
          file: '',
        });
        continue;
      }

      // Validate interpolation placeholders
      const targetPlaceholders = extractPlaceholders(targetText);

      if (!arePlaceholdersEqual(sourcePlaceholders, targetPlaceholders)) {
        errors.push({
          type: 'invalid_interpolation',
          key,
          message: `Interpolation mismatch: source has [${sourcePlaceholders.join(', ')}], target has [${targetPlaceholders.join(', ')}]`,
          file: '',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract interpolation placeholders from text
 */
export function extractPlaceholders(text: string): string[] {
  const pattern = /\{\{([^}]+)\}\}/g;
  const matches = Array.from(text.matchAll(pattern));
  return matches.map((m) => m[1].trim()).sort();
}

/**
 * Check if two placeholder arrays are equal
 */
function arePlaceholdersEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;

  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((val, idx) => val === sorted2[idx]);
}

/**
 * Validate for duplicate keys across multiple translation files
 */
export function validateDuplicateKeys(files: Map<string, TranslationSource>): ValidationError[] {
  const errors: ValidationError[] = [];
  const keyToFiles = new Map<string, string[]>();

  // Collect all keys and their files
  for (const [filePath, translations] of files.entries()) {
    for (const key of Object.keys(translations)) {
      if (!keyToFiles.has(key)) {
        keyToFiles.set(key, []);
      }
      keyToFiles.get(key)!.push(filePath);
    }
  }

  // Find duplicates
  for (const [key, files] of keyToFiles.entries()) {
    if (files.length > 1) {
      errors.push({
        type: 'duplicate_key',
        key,
        message: `Duplicate key found in: ${files.join(', ')}`,
        file: files[0],
      });
    }
  }

  return errors;
}

/**
 * Check for unused keys (keys not found in templates)
 */
export function findUnusedKeys(
  translations: TranslationSource,
  usedKeys: Set<string>,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const key of Object.keys(translations)) {
    if (!usedKeys.has(key)) {
      warnings.push({
        type: 'unused_key',
        key,
        message: `Key '${key}' not found in any template`,
        file: '',
      });
    }
  }

  return warnings;
}

/**
 * Calculate translation coverage statistics
 */
export interface CoverageStats {
  totalKeys: number;
  totalTranslations: number;
  completeTranslations: number;
  missingTranslations: number;
  coveragePercentage: number;
  byLanguage: Map<string, { complete: number; missing: number; percentage: number }>;
}

export function calculateCoverage(
  translations: TranslationSource,
  targetLocales: string[],
): CoverageStats {
  const totalKeys = Object.keys(translations).length;
  const totalTranslations = totalKeys * targetLocales.length;
  let completeTranslations = 0;

  const byLanguage = new Map<string, { complete: number; missing: number; percentage: number }>();

  for (const locale of targetLocales) {
    let complete = 0;
    let missing = 0;

    for (const langs of Object.values(translations)) {
      if (langs[locale] && langs[locale].trim() !== '') {
        complete++;
        completeTranslations++;
      } else {
        missing++;
      }
    }

    byLanguage.set(locale, {
      complete,
      missing,
      percentage: totalKeys > 0 ? Math.round((complete / totalKeys) * 100) : 0,
    });
  }

  return {
    totalKeys,
    totalTranslations,
    completeTranslations,
    missingTranslations: totalTranslations - completeTranslations,
    coveragePercentage:
      totalTranslations > 0 ? Math.round((completeTranslations / totalTranslations) * 100) : 0,
    byLanguage,
  };
}
