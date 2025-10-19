'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.calculateCoverage =
  exports.findUnusedKeys =
  exports.validateDuplicateKeys =
  exports.extractPlaceholders =
  exports.validateTranslations =
    void 0;
/**
 * Validate translations for completeness and correctness
 */
function validateTranslations(translations, targetLocales, sourceLocale = 'en') {
  const errors = [];
  const warnings = [];
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
exports.validateTranslations = validateTranslations;
/**
 * Extract interpolation placeholders from text
 */
function extractPlaceholders(text) {
  const pattern = /\{\{([^}]+)\}\}/g;
  const matches = Array.from(text.matchAll(pattern));
  return matches.map((m) => m[1].trim()).sort();
}
exports.extractPlaceholders = extractPlaceholders;
/**
 * Check if two placeholder arrays are equal
 */
function arePlaceholdersEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
}
/**
 * Validate for duplicate keys across multiple translation files
 */
function validateDuplicateKeys(files) {
  const errors = [];
  const keyToFiles = new Map();
  // Collect all keys and their files
  for (const [filePath, translations] of files.entries()) {
    for (const key of Object.keys(translations)) {
      if (!keyToFiles.has(key)) {
        keyToFiles.set(key, []);
      }
      keyToFiles.get(key).push(filePath);
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
exports.validateDuplicateKeys = validateDuplicateKeys;
/**
 * Check for unused keys (keys not found in templates)
 */
function findUnusedKeys(translations, usedKeys) {
  const warnings = [];
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
exports.findUnusedKeys = findUnusedKeys;
function calculateCoverage(translations, targetLocales) {
  const totalKeys = Object.keys(translations).length;
  const totalTranslations = totalKeys * targetLocales.length;
  let completeTranslations = 0;
  const byLanguage = new Map();
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
exports.calculateCoverage = calculateCoverage;
