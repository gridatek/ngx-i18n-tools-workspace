# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@gridatek/ngx-i18n-tools` is an Angular i18n tooling library that enhances the developer experience by allowing all translations for a single key to be stored together during development, then converting to Angular's standard XLIFF formats for production builds.

**Key Philosophy:** Work WITH Angular's i18n system, not against it. This is a build-time tool that wraps Angular's native `extract-i18n` command.

**Repository:** https://github.com/kgridou/ngx-i18n-tools-workspace

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
   - `validate-builder.ts` - Comprehensive validation and coverage reports

## Build Process

The library requires a multi-step build process due to Angular builders needing to be compiled separately:

1. **Angular Library Build**: `ng build ngx-i18n-tools` - Compiles the library code with ng-packagr
2. **Builders Compilation**: `tsc -p projects/ngx-i18n-tools/src/lib/builders/tsconfig.json` - Compiles Angular builders
3. **Schematics Compilation**: `tsc -p projects/schematics/tsconfig.json` - Compiles ng-add schematics

The `npm run build:lib` script runs all three steps automatically. The output is in `dist/ngx-i18n-tools/`.

**Important**: When developing builders, you must rebuild the library (`npm run build:lib`) for changes to take effect in the demo app, as Angular CLI loads builders from the installed package.

## Translation Files in Demo App

**Important Note:** Translation files (`*.i18n.json`) in the demo app are **generated files** and are **not committed to git**.

**Workflow:**

1. Run `npm run i18n:extract` to generate empty translation files from templates
2. Either:
   - **Automated (for demo/testing):** Run `npm run i18n:fill` to auto-populate with demo translations
   - **Manual (for real projects):** Edit the `.i18n.json` files manually
3. Run `npm run i18n:export` to generate XLIFF files
4. Run `npm run i18n:validate` to check coverage

**Why not commit them?**

- They are auto-generated from templates
- The `i18n:fill` script provides demo data
- In real projects, translators maintain these files
- Keeps the repository clean and focused on source code

**Gitignore entries:**

```
projects/demo-app/**/*.i18n.json
projects/demo-app/**/*.i18n.xml
**/locale/messages.*.xlf
```

### Local Testing Setup

To test the library locally with the demo app:

**Option 1: npm link (recommended for development)**

```bash
cd dist/ngx-i18n-tools
npm link
cd ../..
npm link @gridatek/ngx-i18n-tools
```

**Option 2: npm pack (for realistic testing)**

```bash
cd dist/ngx-i18n-tools
npm pack
cd ../..
npm install ./dist/ngx-i18n-tools/gridatek-ngx-i18n-tools-1.0.0.tgz
```

After linking/installing, the demo app's builders will use the local version of the library.

## Development Commands

### Library Development

```bash
# Build library once
npm run build:lib

# Build library in watch mode
npm run build:lib:watch
# or
ng build ngx-i18n-tools --watch

# Run library tests
npm run test:lib
# or
ng test ngx-i18n-tools

# Run linter
npm run lint:lib
# or
ng lint ngx-i18n-tools
```

### Demo App Development

```bash
# Serve demo app
npm run serve:demo

# Build demo app (all locales)
npm run build:demo

# Build demo app (development, single locale)
npm run build:demo -- --configuration=development
```

### i18n Workflow Commands

```bash
# Extract translations (per-component mode)
npm run i18n:extract
# or
ng run demo-app:extract-i18n

# Extract translations (merged mode - requires angular.json config change)
ng run demo-app:extract-i18n --mode=merged

# Export to XLIFF files
npm run i18n:export
# or
ng run demo-app:i18n-export

# Full sync (extract + export)
npm run i18n:sync

# Validate translations
npm run i18n:validate
# or
ng run demo-app:i18n-validate
```

### Testing Workflow

```bash
# Full automated workflow test (Unix/macOS/Git Bash)
npm run test:workflow

# Full automated workflow test (Windows CMD/PowerShell)
npm run test:workflow:win

# Quick test (build + extract + validate)
npm run test:quick

# Fill missing translations in demo app (auto-generates demo translations)
npm run i18n:fill

# Complete workflow (extract + fill + export)
npm run i18n:complete

# E2E tests with Playwright
npm run test:e2e              # Run all tests headless
npm run test:e2e:ui           # Run tests in UI mode
npm run test:e2e:headed       # Run tests in headed mode
npm run test:e2e:report       # View test report
```

### Mode Switching

```bash
# Convert per-component to merged
npm run i18n:merge
# or
ng run demo-app:i18n-merge

# Convert merged to per-component
npm run i18n:split
# or
ng run demo-app:i18n-split
```

## Key Implementation Files

### Builders

- `projects/ngx-i18n-tools/src/lib/builders/extract-builder.ts` - Core extraction logic, wraps Angular CLI
- `projects/ngx-i18n-tools/src/lib/builders/export-builder.ts` - XLIFF generation from all-in-one format
- `projects/ngx-i18n-tools/src/lib/builders/validate-builder.ts` - Validation and coverage reporting
- `projects/ngx-i18n-tools/src/lib/builders/merge-builder.ts` - Merge per-component → single file
- `projects/ngx-i18n-tools/src/lib/builders/split-builder.ts` - Split single file → per-component
- `projects/ngx-i18n-tools/src/lib/builders/*-schema.json` - Builder option schemas (one per builder)
- `projects/ngx-i18n-tools/builders.json` - Builder registry for Angular CLI

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

### Scripts

- `scripts/fill-translations.js` - Auto-fills missing translations in demo app with predefined demo translations
- `scripts/test-workflow.sh` - Full automated workflow test (Unix/macOS/Git Bash)
- `scripts/test-workflow.bat` - Full automated workflow test (Windows)

### E2E Tests

- `e2e/demo-app.spec.ts` - Playwright tests for demo app covering all locales
- `playwright.config.ts` - Playwright configuration with multi-locale test projects

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

### E2E Tests (Playwright)

The project includes comprehensive E2E tests using Playwright to verify the demo app works correctly:

**Test Coverage:**

- Navigation between pages in all locales
- Translation display correctness (en, es, fr, de)
- Interpolation functionality (e.g., `Hello {{ userName }}`)
- Pluralization functionality (ICU message format)
- Accessibility (navigation, headings, form labels)
- Translation persistence after page reload

**Running E2E Tests:**

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test:e2e

# Run tests with UI for debugging
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

**Configuration:**

- Tests run against 4 locale configurations (en-US, es-ES, fr-FR, de-DE)
- Automatically starts dev server (`npm run serve:demo`)
- Generates HTML reports in `playwright-report/`
- See `e2e/README.md` for detailed documentation

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
- **Node Version:** >=22.0.0
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

## CI/CD Workflows

### Continuous Integration (`.github/workflows/ci.yml`)

The CI workflow runs on every push and pull request to the `main` branch:

**Jobs:**

- **Lint**: Runs `npm run lint:lib` to check code quality
- **Build Library**: Compiles the library and uploads artifacts
- **Test Library**: Runs unit tests with ChromeHeadless
- **Build Demo**: Builds the demo app to verify integration
- **E2E Workflow**: Tests the complete i18n extraction/export workflow
- **E2E Tests**: Runs Playwright tests across all locales (en, es, fr, de)
- **Matrix Build**: Tests on Ubuntu/Windows/macOS with Node 22.x
- **Code Quality**: Checks formatting with Prettier and TypeScript compilation

### Release Workflow (`.github/workflows/release.yml`)

Triggered when pushing a version tag (e.g., `v1.0.0`):

**Jobs:**

1. **Build and Publish**: Runs tests, builds library, publishes to npm, creates GitHub release
2. **Build Demo**: Builds and deploys demo app to GitHub Pages

**To trigger a release:**

```bash
# Update version in package.json files
npm version patch|minor|major

# Push the tag
git push origin v1.0.0
```

### Code Quality Standards

Before committing, ensure:

- Code passes Prettier formatting: `npx prettier --check "**/*.{ts,html,css,json,md}"`
- TypeScript compiles without errors: `npx tsc --noEmit`
- All linter rules pass: `npm run lint:lib`
- All tests pass: `npm run test:lib -- --watch=false --browsers=ChromeHeadless`

The project uses Husky and lint-staged to automatically format code on commit.

## Publishing Checklist

Before publishing a new version:

- [ ] All unit and integration tests passing
- [ ] Demo app builds successfully for all locales
- [ ] Full workflow test passes: `npm run test:workflow` (Unix) or `npm run test:workflow:win` (Windows)
- [ ] README.md complete with examples
- [ ] CHANGELOG.md updated with version changes
- [ ] Schematics tested with `ng add` in a fresh Angular project
- [ ] Code formatted and quality checks pass
- [ ] Version number updated in `package.json` files
- [ ] Build library: `npm run build:lib`
- [ ] Test package contents: `cd dist/ngx-i18n-tools && npm pack --dry-run`
- [ ] Push version tag to trigger release workflow

## Platform-Specific Notes

### Windows Development

- Use `npm run test:workflow:win` instead of `npm run test:workflow` (uses .bat script)
- Git Bash users can use the Unix scripts (`npm run test:workflow`)
- File paths in builders use Node's `path` module for cross-platform compatibility
- Glob patterns work the same on Windows and Unix

### Testing on Multiple Platforms

The CI/CD pipeline tests on Ubuntu, Windows, and macOS with Node 22.x. When making changes that involve:

- File path manipulation
- Shell command execution
- Glob pattern matching

Test on both Unix and Windows platforms to ensure compatibility.

## Troubleshooting

### Builder Not Found Error

If you see `Could not find builder "@gridatek/ngx-i18n-tools:extract"`:

1. Ensure the library is built: `npm run build:lib`
2. Check `dist/ngx-i18n-tools/builders.json` exists
3. Verify the package is linked/installed: `ls node_modules/@gridatek/ngx-i18n-tools`
4. Try unlinking and relinking: `npm unlink @gridatek/ngx-i18n-tools && cd dist/ngx-i18n-tools && npm link && cd ../.. && npm link @gridatek/ngx-i18n-tools`

### Translation Files Not Created

If extraction runs but no `.i18n.json` files appear:

1. Check that templates have `i18n` attributes (e.g., `<h1 i18n="@@welcome">Welcome</h1>`)
2. Verify `templatePattern` in `angular.json` matches your template locations
3. Check Angular's temp XLIFF output was generated (should be created and cleaned up)
4. Look for error messages in the extraction output

### Changes to Builders Not Taking Effect

If you modify a builder but the demo app still uses the old version:

1. Rebuild the library: `npm run build:lib`
2. The `npm link` should automatically pick up changes
3. If using `npm pack`, reinstall: `npm install ./dist/ngx-i18n-tools/gridatek-ngx-i18n-tools-1.0.0.tgz`
4. Clear any caching: delete `dist/demo-app` and rebuild

### XLIFF Files Invalid

If Angular's build fails with XLIFF errors:

1. Check the generated `.xlf` files are valid XML
2. Ensure interpolation placeholders are preserved correctly
3. Verify ICU syntax for plurals is maintained
4. Compare against Angular's expected XLIFF format (run `ng extract-i18n` manually to see expected output)
