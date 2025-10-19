# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@gridatek/ngx-i18n-tools` is an Angular i18n tooling library that enhances the developer experience by allowing all translations for a single key to be stored together during development, then converting to Angular's standard XLIFF formats for production builds.

**Key Philosophy:** Work WITH Angular's i18n system, not against it. This is a build-time tool that wraps Angular's native `extract-i18n` command.

## Workspace Structure

This is an Angular workspace containing:

- `projects/ngx-i18n-tools/` - Main library with Angular builders and converters
- `projects/schematics/` - ng add support for easy installation
- `projects/demo-app/` - Demo application showcasing both per-component and merged modes

## Core Architecture

### Two Operating Modes

1. **Per-Component Mode (Default)**: One translation file per component template (e.g., `home.component.i18n.json`)
2. **Merged Mode**: Single translation file containing all keys from all templates (e.g., `src/locale/translations.json`)

Both modes produce identical XLIFF output for Angular's build system.

### Translation File Format

The library uses an "all-in-one" format during development:

```json
{
  "welcome": {
    "en": "Welcome",
    "es": "Bienvenido",
    "fr": "Bienvenue",
    "de": "Willkommen"
  }
}
```

This gets converted to Angular-compatible XLIFF files (per language) during export.

### Builder Flow

1. **Extract Builder** (`extract-builder.ts`):
   - Wraps Angular's native `ng extract-i18n` command
   - Parses the generated XLIFF output
   - Converts to all-in-one JSON/XML format
   - Creates per-component files OR updates merged file
   - Preserves existing translations during re-extraction

2. **Export Builder** (`export-builder.ts`):
   - Collects all translation files (per-component or merged)
   - Validates translations (completeness, interpolation consistency)
   - Generates XLIFF 1.2 or 2.0 files per target language
   - Output is consumed by Angular's standard build process

3. **Additional Builders**:
   - `merge-builder.ts` - Convert per-component → merged
   - `split-builder.ts` - Convert merged → per-component
   - `validate-builder.ts` - Comprehensive validation
   - `report-builder.ts` - Coverage reports

## Development Commands

### Library Development

```bash
# Build library in watch mode
ng build ngx-i18n-tools --watch

# Run library tests
ng test ngx-i18n-tools

# Run linter
ng lint ngx-i18n-tools
```

### Demo App Development

```bash
# Extract translations (per-component mode)
ng run demo-app:extract-i18n

# Extract translations (merged mode)
ng run demo-app:extract-i18n --mode=merged

# Export to XLIFF files
ng run demo-app:i18n-export

# Full sync (extract + export)
npm run i18n:sync

# Validate translations
ng run demo-app:i18n-validate

# Coverage report
ng run demo-app:i18n-report

# Serve with specific locale
ng serve --configuration=es

# Build all locales
ng build --localize
```

### Mode Switching

```bash
# Convert per-component to merged
ng run demo-app:i18n-merge-all

# Convert merged to per-component
ng run demo-app:i18n-split
```

## Key Implementation Files

### Builders

- `projects/ngx-i18n-tools/src/lib/builders/extract-builder.ts` - Core extraction logic, wraps Angular CLI
- `projects/ngx-i18n-tools/src/lib/builders/export-builder.ts` - XLIFF generation from all-in-one format
- `projects/ngx-i18n-tools/src/lib/builders/schema.json` - Builder option schemas

### Converters

- `projects/ngx-i18n-tools/src/lib/converters/xliff-to-json.converter.ts` - Parse Angular's XLIFF output
- `projects/ngx-i18n-tools/src/lib/converters/json-to-xliff.converter.ts` - Generate Angular-compatible XLIFF
- `projects/ngx-i18n-tools/src/lib/converters/xml-parser.ts` - XML parsing utilities
- `projects/ngx-i18n-tools/src/lib/converters/xliff-generator.ts` - XLIFF 1.2 and 2.0 generation

### Utilities

- `projects/ngx-i18n-tools/src/lib/utils/template-scanner.ts` - Find and analyze templates
- `projects/ngx-i18n-tools/src/lib/utils/file-merger.ts` - Merge translation files, preserve existing
- `projects/ngx-i18n-tools/src/lib/utils/validator.ts` - Comprehensive validation (duplicates, interpolations, completeness)
- `projects/ngx-i18n-tools/src/lib/utils/angular-wrapper.ts` - Spawn Angular CLI commands

### Types

- `projects/ngx-i18n-tools/src/lib/types/index.ts` - TypeScript interfaces for all data structures

## Important Technical Details

### Extract Builder Implementation

The extract builder MUST:

1. Call Angular's native `ng extract-i18n --format=xliff2 --output-path=temp/`
2. Parse the generated XLIFF to extract all translation units
3. Group messages by source file (for per-component mode) or merge all (for merged mode)
4. Load existing translation files to preserve human translations
5. Merge new extractions with existing, handling: new keys, removed keys, updated source text
6. Write output in all-in-one format (JSON or XML)
7. Clean up temp files

### Validation Requirements

When validating translations, check for:

- Duplicate keys across files (error)
- Missing target language translations (warning)
- Interpolation placeholder mismatches (error) - e.g., `{{name}}` vs `{{nombre}}`
- Keys in translation files not found in templates (warning)
- Invalid JSON/XML syntax (error)
- Completeness percentage per language and component

### XLIFF Generation

When generating XLIFF:

- Support both XLIFF 1.2 and 2.0 formats
- Preserve interpolation placeholders as `<ph>` elements
- Maintain ICU syntax for plurals (e.g., `{count, plural, ...}`)
- Include source file locations for debugging
- Generate one file per language (messages.en.xlf, messages.es.xlf, etc.)
- Ensure 100% compatibility with Angular's compiler expectations

## Testing Strategy

### Unit Tests Required

- **Parsers**: XLIFF 1.2/2.0 parsing, JSON/XML translation files, interpolation extraction
- **Converters**: XLIFF ↔ JSON, preserve placeholders/plurals/ICU syntax
- **Validators**: Duplicate keys, missing translations, interpolation consistency
- **Mergers**: File merging, preserve existing, handle conflicts
- **Builders**: Extract/export flows, mode switching

### Integration Tests Required

- Full extraction flow: templates → translation files → re-extraction preserves data
- Full export flow: translation files → XLIFF → Angular build succeeds
- Mode switching: per-component ↔ merged without data loss

### Demo App Tests Required

- All i18n markers have translations
- All locales build successfully
- Interpolations and plurals work correctly
- Add component → extract → translate → build workflow

## Configuration Example

Typical `angular.json` configuration for a project using the library:

```json
{
  "extract-i18n": {
    "builder": "@gridatek/ngx-i18n-tools:extract",
    "options": {
      "mode": "per-component",
      "templatePattern": "src/**/*.component.html",
      "translationFileNaming": "{component}.i18n.json",
      "sourceLocale": "en",
      "targetLocales": ["es", "fr", "de"],
      "preserveExisting": true,
      "validateInterpolations": true
    }
  },
  "i18n-export": {
    "builder": "@gridatek/ngx-i18n-tools:export",
    "options": {
      "translationPattern": "src/**/*.i18n.{json,xml}",
      "outputPath": "src/locale",
      "format": "xliff2",
      "sourceLocale": "en",
      "targetLocales": ["es", "fr", "de"]
    }
  }
}
```

## Technical Constraints

- **Minimum Angular Version:** 17.0.0
- **Node Version:** >=18.0.0
- **TypeScript Version:** >=5.0.0
- **Output Formats:** Must be 100% compatible with Angular's compiler
- **XLIFF Versions:** Support both 1.2 and 2.0
- **Performance:** Must not significantly impact build time (wraps Angular, doesn't reparse)

## Common Pitfalls to Avoid

1. **Do NOT replace Angular's extract-i18n** - Always wrap/call it, never reimplement
2. **Preserve existing translations** - When re-extracting, never lose human translations
3. **Validate interpolation placeholders** - Variable names must match exactly across languages
4. **Handle file encoding properly** - XLIFF files may use UTF-8 with BOM
5. **Support both JSON and XML** - Users should have format choice
6. **Generate valid XLIFF** - Angular's compiler is strict about format compliance

## Schematics (`ng add`)

The `ng add @gridatek/ngx-i18n-tools` schematic should:

1. Update `angular.json` with extract-i18n and i18n-export configurations
2. Create `src/locale/` directory
3. Add npm scripts to `package.json` for i18n commands
4. Display next steps to user

## Publishing Checklist

- All unit and integration tests passing
- Demo app builds successfully for all locales
- README.md complete with examples
- CHANGELOG.md updated
- Schematics tested with `ng add`
- Build library: `ng build ngx-i18n-tools --configuration=production`
- Publish from `dist/ngx-i18n-tools/`
