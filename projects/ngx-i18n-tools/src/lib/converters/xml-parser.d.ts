import { TranslationEntry } from '../types';
/**
 * Parse XLIFF file and extract translation units
 */
export declare function parseXliff(xliffContent: string): TranslationEntry[];
/**
 * Parse custom all-in-one XML format
 */
export declare function parseTranslationXml(
  xmlContent: string,
): Record<string, Record<string, string>>;
/**
 * Build custom all-in-one XML format
 */
export declare function buildTranslationXml(
  translations: Record<string, Record<string, string>>,
): string;
