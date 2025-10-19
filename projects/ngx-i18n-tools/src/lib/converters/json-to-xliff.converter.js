'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.jsonToMultipleXliff = exports.jsonToXliff = exports.jsonToXliffUnits = void 0;
const xliff_generator_1 = require('./xliff-generator');
/**
 * Convert all-in-one JSON format to XLIFF units
 */
function jsonToXliffUnits(translations, sourceLocale, targetLocale) {
  const units = [];
  for (const [key, langs] of Object.entries(translations)) {
    const sourceText = langs[sourceLocale];
    if (!sourceText) continue;
    const unit = {
      id: key,
      source: sourceText,
    };
    if (targetLocale && langs[targetLocale]) {
      unit.target = langs[targetLocale];
    }
    units.push(unit);
  }
  return units;
}
exports.jsonToXliffUnits = jsonToXliffUnits;
/**
 * Convert all-in-one JSON to XLIFF file content
 */
function jsonToXliff(translations, sourceLocale, targetLocale, format) {
  const units = jsonToXliffUnits(translations, sourceLocale, targetLocale);
  return (0, xliff_generator_1.generateXliff)(units, sourceLocale, targetLocale, format);
}
exports.jsonToXliff = jsonToXliff;
/**
 * Convert all-in-one JSON to multiple XLIFF files (one per language)
 */
function jsonToMultipleXliff(translations, sourceLocale, targetLocales, format) {
  const result = new Map();
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
exports.jsonToMultipleXliff = jsonToMultipleXliff;
