import { XMLBuilder } from 'fast-xml-parser';
import { XliffFile, XliffUnit } from '../types';

/**
 * Generate XLIFF 2.0 file content
 */
export function generateXliff2(xliffFile: XliffFile): string {
  const xmlObj: any = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    xliff: {
      '@_version': '2.0',
      '@_xmlns': 'urn:oasis:names:tc:xliff:document:2.0',
      '@_srcLang': xliffFile.sourceLanguage,
      file: {
        '@_id': 'ngi18n',
        '@_original': 'ng.template',
        unit: xliffFile.units.map(unit => generateUnit2(unit, xliffFile.targetLanguage))
      }
    }
  };

  if (xliffFile.targetLanguage) {
    xmlObj.xliff['@_trgLang'] = xliffFile.targetLanguage;
  }

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true
  });

  return builder.build(xmlObj);
}

/**
 * Generate XLIFF 1.2 file content
 */
export function generateXliff1(xliffFile: XliffFile): string {
  const xmlObj: any = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    xliff: {
      '@_version': '1.2',
      '@_xmlns': 'urn:oasis:names:tc:xliff:document:1.2',
      file: {
        '@_source-language': xliffFile.sourceLanguage,
        '@_datatype': 'plaintext',
        '@_original': 'ng.template',
        body: {
          'trans-unit': xliffFile.units.map(unit => generateUnit1(unit, xliffFile.targetLanguage))
        }
      }
    }
  };

  if (xliffFile.targetLanguage) {
    xmlObj.xliff.file['@_target-language'] = xliffFile.targetLanguage;
  }

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true
  });

  return builder.build(xmlObj);
}

/**
 * Generate XLIFF 2.0 unit
 */
function generateUnit2(unit: XliffUnit, targetLanguage?: string): any {
  const segment: any = {
    source: processInterpolations(unit.source)
  };

  if (targetLanguage && unit.target) {
    segment.target = processInterpolations(unit.target);
  }

  const unitObj: any = {
    '@_id': unit.id,
    segment
  };

  if (unit.note) {
    unitObj.notes = {
      note: unit.note
    };
  }

  return unitObj;
}

/**
 * Generate XLIFF 1.2 trans-unit
 */
function generateUnit1(unit: XliffUnit, targetLanguage?: string): any {
  const transUnit: any = {
    '@_id': unit.id,
    '@_datatype': 'html',
    source: processInterpolations(unit.source, '1.2')
  };

  if (targetLanguage && unit.target) {
    transUnit.target = processInterpolations(unit.target, '1.2');
  }

  if (unit.note) {
    transUnit.note = unit.note;
  }

  if (unit.sourceFile) {
    transUnit['@_datatype'] = unit.sourceFile;
  }

  return transUnit;
}

/**
 * Process interpolations in text, converting {{var}} to XLIFF placeholders
 */
function processInterpolations(text: string, version: '1.2' | '2.0' = '2.0'): any {
  // Simple implementation: detect {{...}} patterns
  const interpolationPattern = /\{\{([^}]+)\}\}/g;
  const matches = Array.from(text.matchAll(interpolationPattern));

  if (matches.length === 0) {
    return text;
  }

  // For XLIFF with placeholders, we need to structure the content
  const parts: any[] = [];
  let lastIndex = 0;
  let phId = 0;

  for (const match of matches) {
    const startIndex = match.index!;
    const matchText = match[0];
    const varName = match[1].trim();

    // Add text before interpolation
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // Add placeholder
    if (version === '2.0') {
      parts.push({
        ph: {
          '@_id': phId.toString(),
          '@_equiv': 'INTERPOLATION',
          '@_disp': `{{${varName}}}`
        }
      });
    } else {
      parts.push({
        x: {
          '@_id': phId.toString(),
          '@_equiv-text': `{{${varName}}}`
        }
      });
    }

    lastIndex = startIndex + matchText.length;
    phId++;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If we have complex structure, return as object
  if (parts.length === 1 && typeof parts[0] === 'string') {
    return parts[0];
  }

  // Return mixed content structure
  return {
    '#text': parts.filter(p => typeof p === 'string').join(''),
    ...(parts.find(p => typeof p === 'object') || {})
  };
}

/**
 * Generate XLIFF file based on format
 */
export function generateXliff(
  units: XliffUnit[],
  sourceLanguage: string,
  targetLanguage: string | undefined,
  format: 'xliff' | 'xliff2'
): string {
  const xliffFile: XliffFile = {
    version: format === 'xliff2' ? '2.0' : '1.2',
    sourceLanguage,
    targetLanguage,
    units
  };

  return format === 'xliff2' ? generateXliff2(xliffFile) : generateXliff1(xliffFile);
}
