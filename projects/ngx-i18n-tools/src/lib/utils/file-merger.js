'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.initializeTranslations =
  exports.sortTranslationKeys =
  exports.mergeMultipleFiles =
  exports.mergeTranslations =
    void 0;
/**
 * Merge new extractions with existing translations
 * Preserves human translations while updating structure
 */
function mergeTranslations(newTranslations, existingTranslations, targetLocales, options) {
  const merged = {};
  const result = {
    added: [],
    updated: [],
    removed: [],
    preserved: [],
  };
  // Process new translations
  for (const [key, newLangs] of Object.entries(newTranslations)) {
    if (existingTranslations[key]) {
      // Key exists - merge translations
      merged[key] = {};
      for (const locale of Object.keys(newLangs)) {
        if (options.preserveExisting && existingTranslations[key][locale]) {
          // Preserve existing translation
          merged[key][locale] = existingTranslations[key][locale];
          result.preserved.push(key);
        } else {
          // Use new translation
          merged[key][locale] = newLangs[locale];
        }
      }
      // Check if source text changed
      const sourceLocale = Object.keys(newLangs)[0];
      if (existingTranslations[key][sourceLocale] !== newLangs[sourceLocale]) {
        result.updated.push(key);
      }
    } else {
      // New key
      merged[key] = { ...newLangs };
      // Initialize empty translations for target locales
      for (const locale of targetLocales) {
        if (!merged[key][locale]) {
          merged[key][locale] = '';
        }
      }
      result.added.push(key);
    }
  }
  // Handle removed keys
  for (const key of Object.keys(existingTranslations)) {
    if (!newTranslations[key]) {
      if (!options.cleanUnused) {
        // Keep unused key
        merged[key] = existingTranslations[key];
      }
      result.removed.push(key);
    }
  }
  return { merged, result };
}
exports.mergeTranslations = mergeTranslations;
/**
 * Merge multiple translation files into one
 */
function mergeMultipleFiles(files) {
  const merged = {};
  for (const [filePath, translations] of files.entries()) {
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
exports.mergeMultipleFiles = mergeMultipleFiles;
/**
 * Sort translation keys alphabetically
 */
function sortTranslationKeys(translations) {
  const sorted = {};
  const keys = Object.keys(translations).sort();
  for (const key of keys) {
    sorted[key] = translations[key];
  }
  return sorted;
}
exports.sortTranslationKeys = sortTranslationKeys;
/**
 * Initialize empty translations for target locales
 */
function initializeTranslations(keys, sourceLocale, sourceTexts, targetLocales) {
  const translations = {};
  for (const key of keys) {
    translations[key] = {
      [sourceLocale]: sourceTexts.get(key) || '',
    };
    for (const locale of targetLocales) {
      translations[key][locale] = '';
    }
  }
  return translations;
}
exports.initializeTranslations = initializeTranslations;
