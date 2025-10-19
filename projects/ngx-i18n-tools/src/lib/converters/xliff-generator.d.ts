import { XliffFile, XliffUnit } from '../types';
/**
 * Generate XLIFF 2.0 file content
 */
export declare function generateXliff2(xliffFile: XliffFile): string;
/**
 * Generate XLIFF 1.2 file content
 */
export declare function generateXliff1(xliffFile: XliffFile): string;
/**
 * Generate XLIFF file based on format
 */
export declare function generateXliff(
  units: XliffUnit[],
  sourceLanguage: string,
  targetLanguage: string | undefined,
  format: 'xliff' | 'xliff2',
): string;
