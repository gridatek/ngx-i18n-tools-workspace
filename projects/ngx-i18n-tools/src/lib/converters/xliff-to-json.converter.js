'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.mergeXliffFiles = exports.xliffToJson = void 0;
const xml_parser_1 = require('./xml-parser');
/**
 * Convert XLIFF entries to all-in-one JSON format
 */
function xliffToJson(xliffContent, sourceLocale, targetLocales) {
  const entries = (0, xml_parser_1.parseXliff)(xliffContent);
  const result = {};
  for (const entry of entries) {
    if (!entry.id) continue;
    result[entry.id] = {
      [sourceLocale]: entry.source,
    };
    // Initialize empty target locales
    for (const locale of targetLocales) {
      result[entry.id][locale] = entry.target || '';
    }
  }
  return result;
}
exports.xliffToJson = xliffToJson;
/**
 * Convert multiple XLIFF files (one per language) to all-in-one format
 */
function mergeXliffFiles(xliffFiles, sourceLocale) {
  const result = {};
  for (const [locale, xliffContent] of xliffFiles.entries()) {
    const entries = (0, xml_parser_1.parseXliff)(xliffContent);
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
exports.mergeXliffFiles = mergeXliffFiles;
