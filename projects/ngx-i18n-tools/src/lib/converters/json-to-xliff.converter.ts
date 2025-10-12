import { TranslationSource, XliffUnit } from '../types';
import { generateXliff } from './xliff-generator';

/**
 * Convert all-in-one JSON format to XLIFF units
 */
export function jsonToXliffUnits(
  translations: TranslationSource,
  sourceLocale: string,
  targetLocale?: string
): XliffUnit[] {
  const units: XliffUnit[] = [];

  for (const [key, langs] of Object.entries(translations)) {
    const sourceText = langs[sourceLocale];
    if (!sourceText) continue;

    const unit: XliffUnit = {
      id: key,
      source: sourceText
    };

    if (targetLocale && langs[targetLocale]) {
      unit.target = langs[targetLocale];
    }

    units.push(unit);
  }

  return units;
}

/**
 * Convert all-in-one JSON to XLIFF file content
 */
export function jsonToXliff(
  translations: TranslationSource,
  sourceLocale: string,
  targetLocale: string | undefined,
  format: 'xliff' | 'xliff2'
): string {
  const units = jsonToXliffUnits(translations, sourceLocale, targetLocale);
  return generateXliff(units, sourceLocale, targetLocale, format);
}

/**
 * Convert all-in-one JSON to multiple XLIFF files (one per language)
 */
export function jsonToMultipleXliff(
  translations: TranslationSource,
  sourceLocale: string,
  targetLocales: string[],
  format: 'xliff' | 'xliff2'
): Map<string, string> {
  const result = new Map<string, string>();

  // Generate source locale XLIFF
  const sourceXliff = jsonToXliff(translations, sourceLocale, undefined, format);
  result.set(sourceLocale, sourceXliff);

  // Generate target locale XLIFFs
  for (const targetLocale of targetLocales) {
    const targetXliff = jsonToXliff(translations, sourceLocale, targetLocale, format);
    result.set(targetLocale, targetXliff);
  }

  return result;
}
