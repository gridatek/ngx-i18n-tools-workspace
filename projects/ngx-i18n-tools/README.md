# @gridatek/ngx-i18n-tools

> **Better Developer Experience for Angular i18n** - Keep all translations together during development, convert to XLIFF for production.

[![npm version](https://badge.fury.io/js/%40gridatek%2Fngx-i18n-tools.svg)](https://www.npmjs.com/package/@gridatek/ngx-i18n-tools)
[![CI](https://github.com/gridatek/ngx-i18n-tools-workspace/workflows/CI/badge.svg)](https://github.com/gridatek/ngx-i18n-tools-workspace/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## The Problem

Angular's native i18n is powerful but managing translations across multiple XLIFF files is tedious:

**Traditional workflow:** To translate "Welcome", you need to edit:

- `messages.en.xlf` → Find the entry → Add English text
- `messages.es.xlf` → Find the entry → Add Spanish text
- `messages.fr.xlf` → Find the entry → Add French text
- `messages.de.xlf` → Find the entry → Add German text

❌ Scattered translations
❌ Easy to miss languages
❌ Hard to see what's translated
❌ Difficult to review changes

## The Solution

**ngx-i18n-tools** lets you keep all translations together during development:

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

✅ All languages together
✅ Easy to spot missing translations
✅ Simple code reviews
✅ Better developer experience
✅ **100% compatible with Angular's compiler** - generates standard XLIFF for production

## How It Works

Unlike tools that just merge XLIFF files, ngx-i18n-tools provides a **developer-friendly abstraction layer**:

1. **Development**: Work with intuitive JSON/XML format (all languages together)
2. **Build**: Automatically converts to Angular's XLIFF format
3. **Production**: Standard Angular i18n build process (no runtime overhead)

**Key principle**: We wrap Angular's native `extract-i18n`, ensuring 100% compatibility.

## Features

### 🎯 All-in-One Translation Format

See all language translations for a key in one place. No more jumping between files.

### 📁 Two Operating Modes

- **Per-Component**: One translation file per component (e.g., `home.component.i18n.json`)
- **Merged**: Single file with all translations (e.g., `translations.json`)

Switch between modes anytime with `ng run app:i18n-merge` and `ng run app:i18n-split`.

### 🎨 JSON or XML Format

Choose what works best for your team:

- **JSON**: Clean, readable, great for code reviews
- **XML**: Traditional, works well with XML editors

### 🔄 Smart Re-Extraction

Re-run extraction anytime - existing translations are preserved automatically.

### ✅ Comprehensive Validation

Catch errors before they reach production:

- Missing translations
- Interpolation mismatches (e.g., `{{name}}` vs `{{nombre}}`)
- Duplicate keys
- Unused translation keys

### 🏗️ Angular Builders Integration

Works seamlessly with Angular CLI:

```bash
ng run app:extract-i18n    # Extract translations
ng run app:i18n-export     # Generate XLIFF files
ng run app:i18n-validate   # Validate translations
ng run app:i18n-merge      # Merge to single file
ng run app:i18n-split      # Split to per-component files
```

## Installation

```bash
npm install @gridatek/ngx-i18n-tools --save-dev
ng add @gridatek/ngx-i18n-tools
```

The `ng add` command will:

- Update `angular.json` with builder configurations
- Create `src/locale/` directory
- Add helpful npm scripts to `package.json`

## Quick Start

### 1. Mark Templates with i18n

```html
<!-- app.component.html -->
<h1 i18n="@@welcome">Welcome</h1>
<p i18n="@@greeting">Hello {{userName}}!</p>
<span i18n="@@items.count"
  >{count, plural, =0 {No items} =1 {One item} other {{{count}} items}}</span
>
```

### 2. Extract Translations

```bash
ng run your-app:extract-i18n
```

This generates files like `app.component.i18n.json`:

```json
{
  "welcome": {
    "en": "Welcome"
  },
  "greeting": {
    "en": "Hello {{userName}}!"
  },
  "items.count": {
    "en": "{count, plural, =0 {No items} =1 {One item} other {{{count}} items}}"
  }
}
```

### 3. Add Translations

Edit the generated files to add your translations:

```json
{
  "welcome": {
    "en": "Welcome",
    "es": "Bienvenido",
    "fr": "Bienvenue",
    "de": "Willkommen"
  },
  "greeting": {
    "en": "Hello {{userName}}!",
    "es": "¡Hola {{userName}}!",
    "fr": "Bonjour {{userName}}!",
    "de": "Hallo {{userName}}!"
  }
}
```

### 4. Validate Translations

```bash
ng run your-app:i18n-validate
```

Output:

```
✓ All validations passed

📊 Translation Coverage:
Overall: 100% (6/6)

By Language:
  ✓ es: 100% (2/2)
  ✓ fr: 100% (2/2)
  ✓ de: 100% (2/2)
```

### 5. Export to XLIFF

```bash
ng run your-app:i18n-export
```

Generates standard Angular XLIFF files:

- `src/locale/messages.en.xlf`
- `src/locale/messages.es.xlf`
- `src/locale/messages.fr.xlf`
- `src/locale/messages.de.xlf`

### 6. Build with Localization

```bash
ng build --localize
```

Angular builds separate bundles for each language using the generated XLIFF files.

## Configuration

The `ng add` command configures `angular.json` for you. Here's what it looks like:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "extract-i18n": {
          "builder": "@gridatek/ngx-i18n-tools:extract",
          "options": {
            "mode": "per-component",
            "templatePattern": "src/**/*.component.html",
            "translationFileNaming": "{component}.i18n.json",
            "outputFormat": "json",
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
        },
        "i18n-validate": {
          "builder": "@gridatek/ngx-i18n-tools:validate",
          "options": {
            "translationPattern": "src/**/*.i18n.{json,xml}",
            "sourceLocale": "en",
            "targetLocales": ["es", "fr", "de"]
          }
        }
      }
    }
  }
}
```

### Configuration Options

#### Extract Builder Options

| Option                   | Type                          | Default                     | Description                                     |
| ------------------------ | ----------------------------- | --------------------------- | ----------------------------------------------- |
| `mode`                   | `'per-component' \| 'merged'` | `'per-component'`           | Operating mode                                  |
| `templatePattern`        | `string`                      | `'src/**/*.component.html'` | Glob pattern for templates                      |
| `translationFileNaming`  | `string`                      | `'{component}.i18n.json'`   | Naming pattern for per-component files          |
| `outputFile`             | `string`                      | -                           | Output file path (merged mode only)             |
| `outputFormat`           | `'json' \| 'xml'`             | `'json'`                    | Output file format                              |
| `sourceLocale`           | `string`                      | `'en'`                      | Source language code                            |
| `targetLocales`          | `string[]`                    | `[]`                        | Target language codes                           |
| `preserveExisting`       | `boolean`                     | `true`                      | Preserve existing translations on re-extraction |
| `validateInterpolations` | `boolean`                     | `true`                      | Validate interpolation placeholders             |
| `sortKeys`               | `boolean`                     | `true`                      | Sort translation keys alphabetically            |

#### Export Builder Options

| Option               | Type                  | Default                      | Description                        |
| -------------------- | --------------------- | ---------------------------- | ---------------------------------- |
| `translationPattern` | `string`              | `'src/**/*.i18n.{json,xml}'` | Glob pattern for translation files |
| `outputPath`         | `string`              | `'src/locale'`               | Output directory for XLIFF files   |
| `format`             | `'xliff' \| 'xliff2'` | `'xliff2'`                   | XLIFF version                      |
| `sourceLocale`       | `string`              | `'en'`                       | Source language code               |
| `targetLocales`      | `string[]`            | `[]`                         | Target language codes              |

## Workflows

### Per-Component Workflow

Best for: Large apps, team collaboration, component ownership

```bash
# Extract (creates one file per component)
ng run app:extract-i18n

# Files created:
# src/app/home/home.component.i18n.json
# src/app/profile/profile.component.i18n.json
# src/app/shared/header/header.component.i18n.json

# Translate files
# (Each team member can work on their component's translations)

# Validate
ng run app:i18n-validate

# Export to XLIFF
ng run app:i18n-export

# Build
ng build --localize
```

### Merged Workflow

Best for: Smaller apps, centralized translation management, translation services

```bash
# Option 1: Merge existing per-component files
ng run app:i18n-merge
# Creates: src/locale/translations.json

# Option 2: Extract directly in merged mode
# (Update angular.json: mode: "merged", outputFile: "src/locale/translations.json")
ng run app:extract-i18n

# Translate the single file
# src/locale/translations.json

# Validate
ng run app:i18n-validate

# Export to XLIFF
ng run app:i18n-export

# Build
ng build --localize

# Optional: Split back to per-component
ng run app:i18n-split
```

### XML Format

Use XML format if you prefer traditional i18n file formats:

```bash
# Update angular.json: outputFormat: "xml"
ng run app:extract-i18n

# Creates .i18n.xml files
# Edit with your preferred XML editor
# Export and build as usual
```

## Comparison with Other Tools

| Tool                  | Approach                                | Maintained          | Angular Compatibility |
| --------------------- | --------------------------------------- | ------------------- | --------------------- |
| **ngx-i18n-tools**    | All-in-one dev format → XLIFF for build | ✅ Active           | ✅ All versions       |
| ngx-i18nsupport       | XLIFF merging                           | ❌ Deprecated       | ❌ Angular <12 only   |
| ng-extract-i18n-merge | XLIFF merging                           | ✅ Active           | ✅ Modern Angular     |
| ngx-i18n-combine      | Component merging                       | ❌ Abandoned (2020) | ❌ Angular <9         |

**Key difference**: Other tools work directly with XLIFF files. We provide a better development format that converts to XLIFF automatically.

## Requirements

- Angular >= 15.0.0

## FAQ

### Q: Does this add runtime overhead?

**A:** No! This is a build-time tool. The final app uses Angular's standard i18n compilation.

### Q: Can I use this with existing XLIFF files?

**A:** Yes! Run extraction first - it will convert your existing XLIFF to the all-in-one format while preserving translations.

### Q: What if I need to send translations to external translators?

**A:** Export to XLIFF (`ng run app:i18n-export`) and send those. Import back by placing the XLIFF files in your `locale/` folder and running extraction again.

### Q: Can I customize the translation file locations?

**A:** Yes! Adjust the `templatePattern` and `translationFileNaming` options in `angular.json`.

### Q: Does this work with lazy-loaded modules?

**A:** Yes! Extraction scans all templates regardless of how they're loaded.

## Troubleshooting

### Builder not found error

```bash
# Ensure the package is installed
npm install @gridatek/ngx-i18n-tools --save-dev

# Verify angular.json has correct builder references
# Should be: "@gridatek/ngx-i18n-tools:extract"
```

### Translations not updating

```bash
# Clear cache and rebuild
rm -rf dist/
ng run app:extract-i18n
ng run app:i18n-export
ng build --localize
```

### Missing translations warnings

The validator will warn about missing translations. This is intentional - fill them in before building for production.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](https://github.com/gridatek/ngx-i18n-tools-workspace/blob/main/CONTRIBUTING.md) for guidelines.

## Repository

Full source code and demo app: [github.com/gridatek/ngx-i18n-tools-workspace](https://github.com/gridatek/ngx-i18n-tools-workspace)

## License

MIT © [Gridatek Team](https://github.com/gridatek)

## Support

- 📖 [Documentation](https://github.com/gridatek/ngx-i18n-tools-workspace/blob/main/ngx-i18n-tools-doc.md)
- 🐛 [Issue Tracker](https://github.com/gridatek/ngx-i18n-tools-workspace/issues)
- 💬 [Discussions](https://github.com/gridatek/ngx-i18n-tools-workspace/discussions)
