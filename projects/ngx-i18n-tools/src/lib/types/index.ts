import { JsonObject } from '@angular-devkit/core';

/**
 * Translation source format (all-in-one)
 * Key -> Language Code -> Translation
 */
export interface TranslationSource {
  [key: string]: {
    [languageCode: string]: string;
  };
}

/**
 * Parsed translation entry from XLIFF
 */
export interface TranslationEntry {
  id: string;
  source: string;
  target?: string;
  sourceFile?: string;
  lineNumber?: number;
  description?: string;
  meaning?: string;
}

/**
 * Translation file metadata
 */
export interface TranslationFile {
  path: string;
  format: 'json' | 'xml';
  entries: Map<string, TranslationSource[string]>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type:
    | 'duplicate_key'
    | 'missing_language'
    | 'invalid_interpolation'
    | 'invalid_format'
    | 'template_mismatch';
  key: string;
  message: string;
  file: string;
  line?: number;
}

export interface ValidationWarning {
  type: 'incomplete_translation' | 'unused_key' | 'inconsistent_interpolation';
  key: string;
  message: string;
  file: string;
}

/**
 * Extract builder options
 */
export interface ExtractOptions {
  mode: 'per-component' | 'merged';
  templatePattern: string;
  translationFileNaming?: string;
  outputFile?: string;
  outputFormat: 'json' | 'xml';
  sourceLocale: string;
  targetLocales: string[];
  preserveExisting: boolean;
  cleanUnused: boolean;
  validateInterpolations: boolean;
  sortKeys?: boolean;
}

/**
 * Export builder options
 */
export interface ExportOptions {
  source?: string;
  translationPattern?: string;
  outputPath: string;
  format: 'xliff' | 'xliff2';
  sourceLocale: string;
  targetLocales: string[];
}

/**
 * Merge result
 */
export interface MergeResult {
  added: string[];
  updated: string[];
  removed: string[];
  preserved: string[];
}

/**
 * XLIFF unit for generation
 */
export interface XliffUnit {
  id: string;
  source: string;
  target?: string;
  sourceFile?: string;
  note?: string;
}

export interface XliffFile {
  version: '1.2' | '2.0';
  sourceLanguage: string;
  targetLanguage?: string;
  units: XliffUnit[];
}

/**
 * Translation map for internal use
 */
export type TranslationMap = Map<string, TranslationSource[string]>;

/**
 * Component to translations mapping
 */
export interface ComponentTranslations {
  componentPath: string;
  templatePath: string;
  translationPath: string;
  translations: TranslationSource;
}
