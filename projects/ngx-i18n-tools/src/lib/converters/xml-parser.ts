import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { TranslationEntry } from '../types';

/**
 * Parse XLIFF file and extract translation units
 */
export function parseXliff(xliffContent: string): TranslationEntry[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: false,
    trimValues: true,
  });

  const parsed = parser.parse(xliffContent);
  const entries: TranslationEntry[] = [];

  // Check XLIFF version
  if (parsed.xliff) {
    const version = parsed.xliff['@_version'];

    if (version === '2.0') {
      entries.push(...parseXliff2(parsed));
    } else if (version === '1.2') {
      entries.push(...parseXliff1(parsed));
    } else {
      throw new Error(`Unsupported XLIFF version: ${version}`);
    }
  }

  return entries;
}

/**
 * Parse XLIFF 2.0 format
 */
function parseXliff2(parsed: any): TranslationEntry[] {
  const entries: TranslationEntry[] = [];
  const file = parsed.xliff.file;

  if (!file) return entries;

  const units = Array.isArray(file.unit) ? file.unit : [file.unit];

  for (const unit of units) {
    if (!unit) continue;

    const segment = unit.segment;
    if (!segment) continue;

    const entry: TranslationEntry = {
      id: unit['@_id'] || '',
      source: extractText(segment.source),
      target: segment.target ? extractText(segment.target) : undefined,
      description: unit.notes?.note || undefined,
    };

    entries.push(entry);
  }

  return entries;
}

/**
 * Parse XLIFF 1.2 format
 */
function parseXliff1(parsed: any): TranslationEntry[] {
  const entries: TranslationEntry[] = [];
  const file = parsed.xliff.file;

  if (!file) return entries;

  const body = file.body;
  if (!body) return entries;

  const transUnits = Array.isArray(body['trans-unit']) ? body['trans-unit'] : [body['trans-unit']];

  for (const unit of transUnits) {
    if (!unit) continue;

    const entry: TranslationEntry = {
      id: unit['@_id'] || '',
      source: extractText(unit.source),
      target: unit.target ? extractText(unit.target) : undefined,
      description: unit.note || undefined,
      sourceFile: unit['@_datatype'] || undefined,
    };

    entries.push(entry);
  }

  return entries;
}

/**
 * Extract text content from XML node, handling interpolations
 */
function extractText(node: any): string {
  if (typeof node === 'string') {
    return node;
  }

  if (!node) return '';

  // Handle nodes with text and placeholder elements
  let text = '';

  if (node['#text']) {
    text = node['#text'];
  }

  // Handle XLIFF 2.0 placeholders
  if (node.ph) {
    const placeholders = Array.isArray(node.ph) ? node.ph : [node.ph];
    for (const ph of placeholders) {
      const display = ph['@_disp'] || ph['@_equiv'] || ph['#text'] || '';
      text += display;
    }
  }

  // Handle XLIFF 1.2 placeholders
  if (node['x']) {
    const placeholders = Array.isArray(node['x']) ? node['x'] : [node['x']];
    for (const ph of placeholders) {
      const display = ph['@_equiv'] || ph['#text'] || '';
      text += display;
    }
  }

  return text.trim();
}

/**
 * Parse custom all-in-one XML format
 */
export function parseTranslationXml(xmlContent: string): Record<string, Record<string, string>> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: false,
    trimValues: true,
  });

  const parsed = parser.parse(xmlContent);
  const result: Record<string, Record<string, string>> = {};

  if (!parsed.translations || !parsed.translations.translation) {
    return result;
  }

  const translations = Array.isArray(parsed.translations.translation)
    ? parsed.translations.translation
    : [parsed.translations.translation];

  for (const trans of translations) {
    const key = trans['@_key'];
    if (!key) continue;

    result[key] = {};

    // Extract all language nodes
    for (const [langCode, value] of Object.entries(trans)) {
      if (langCode.startsWith('@_')) continue;
      result[key][langCode] = value as string;
    }
  }

  return result;
}

/**
 * Build custom all-in-one XML format
 */
export function buildTranslationXml(translations: Record<string, Record<string, string>>): string {
  const xmlObj: any = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    translations: {
      translation: [],
    },
  };

  for (const [key, langs] of Object.entries(translations)) {
    const translationNode: any = { '@_key': key };

    for (const [langCode, text] of Object.entries(langs)) {
      translationNode[langCode] = text;
    }

    xmlObj.translations.translation.push(translationNode);
  }

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true,
  });

  return builder.build(xmlObj);
}
