import { TranslationEntry, TranslationSource } from '../types';
import { parseXliff } from './xml-parser';

/**
 * Convert XLIFF entries to all-in-one JSON format
 */
export function xliffToJson(
  xliffContent: string,
  sourceLocale: string,
  targetLocales: string[]
): TranslationSource {
  const entries = parseXliff(xliffContent);
  const result: TranslationSource = {};

  for (const entry of entries) {
    if (!entry.id) continue;

    result[entry.id] = {
      [sourceLocale]: entry.source
    };

    // Initialize empty target locales
    for (const locale of targetLocales) {
      result[entry.id][locale] = entry.target || '';
    }
  }

  return result;
}

/**
 * Convert multiple XLIFF files (one per language) to all-in-one format
 */
export function mergeXliffFiles(
  xliffFiles: Map<string, string>,
  sourceLocale: string
): TranslationSource {
  const result: TranslationSource = {};

  for (const [locale, xliffContent] of xliffFiles.entries()) {
    const entries = parseXliff(xliffContent);

    for (const entry of entries) {
      if (!entry.id) continue;

      if (!result[entry.id]) {
        result[entry.id] = {};
      }

      // For source locale, use source text
      // For target locales, use target text if available
      if (locale === sourceLocale) {
        result[entry.id][locale] = entry.source;
      } else {
        result[entry.id][locale] = entry.target || '';
      }
    }
  }

  return result;
}
