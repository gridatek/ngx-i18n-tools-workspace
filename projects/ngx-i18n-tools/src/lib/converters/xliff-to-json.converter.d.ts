import { TranslationSource } from '../types';
/**
 * Convert XLIFF entries to all-in-one JSON format
 */
export declare function xliffToJson(
  xliffContent: string,
  sourceLocale: string,
  targetLocales: string[],
): TranslationSource;
/**
 * Convert multiple XLIFF files (one per language) to all-in-one format
 */
export declare function mergeXliffFiles(
  xliffFiles: Map<string, string>,
  sourceLocale: string,
): TranslationSource;
