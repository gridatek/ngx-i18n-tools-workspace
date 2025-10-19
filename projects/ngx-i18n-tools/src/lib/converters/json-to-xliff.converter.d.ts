import { TranslationSource, XliffUnit } from '../types';
/**
 * Convert all-in-one JSON format to XLIFF units
 */
export declare function jsonToXliffUnits(
  translations: TranslationSource,
  sourceLocale: string,
  targetLocale?: string,
): XliffUnit[];
/**
 * Convert all-in-one JSON to XLIFF file content
 */
export declare function jsonToXliff(
  translations: TranslationSource,
  sourceLocale: string,
  targetLocale: string | undefined,
  format: 'xliff' | 'xliff2',
): string;
/**
 * Convert all-in-one JSON to multiple XLIFF files (one per language)
 */
export declare function jsonToMultipleXliff(
  translations: TranslationSource,
  sourceLocale: string,
  targetLocales: string[],
  format: 'xliff' | 'xliff2',
): Map<string, string>;
