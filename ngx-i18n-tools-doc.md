# @gridatek/ngx-i18n-tools - Development Instructions

## Project Overview

Create an Angular i18n tooling library called `@gridatek/ngx-i18n-tools` that integrates with Angular's native i18n mechanisms (`$localize`, `ng extract-i18n`). The library provides a **superior developer experience** by allowing all translations for a single key to be stored together during development, then converting to Angular's standard formats for production builds.

**Key Philosophy:** Work WITH Angular's i18n system, not against it. This is a build-time tool that enhances the development workflow while producing standard Angular i18n output.

**Core Innovation:** Our extract builder wraps Angular's native `extract-i18n` command and automatically converts the output to an all-in-one format where each key contains all language translations together.

---

## Workspace Structure

```
ngx-i18n-tools-workspace/
├── projects/
│   ├── ngx-i18n-tools/     # Main library
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── builders/
│   │   │   │   │   ├── extract-builder.ts
│   │   │   │   │   ├── export-builder.ts
│   │   │   │   │   ├── merge-builder.ts
│   │   │   │   │   ├── split-builder.ts
│   │   │   │   │   ├── validate-builder.ts
│   │   │   │   │   └── schema.json
│   │   │   │   ├── converters/
│   │   │   │   │   ├── xliff-to-json.converter.ts
│   │   │   │   │   ├── json-to-xliff.converter.ts
│   │   │   │   │   ├── xml-parser.ts
│   │   │   │   │   └── xliff-generator.ts
│   │   │   │   ├── utils/
│   │   │   │   │   ├── template-scanner.ts
│   │   │   │   │   ├── file-merger.ts
│   │   │   │   │   ├── validator.ts
│   │   │   │   │   └── angular-wrapper.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── public-api.ts
│   │   ├── builders.json
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── schematics/                   # ng add support
│   │   ├── ng-add/
│   │   │   ├── index.ts
│   │   │   └── schema.json
│   │   └── collection.json
│   │
│   └── demo-app/                     # Demo application
│       ├── src/
│       │   ├── app/
│       │   │   ├── home/
│       │   │   │   ├── home.component.ts
│       │   │   │   ├── home.component.html
│       │   │   │   └── home.component.i18n.json
│       │   │   ├── features/
│       │   │   │   ├── user-profile/
│       │   │   │   │   ├── user-profile.component.ts
│       │   │   │   │   ├── user-profile.component.html
│       │   │   │   │   └── user-profile.component.i18n.json
│       │   │   │   └── settings/
│       │   │   │       ├── settings.component.ts
│       │   │   │       ├── settings.component.html
│       │   │   │       └── settings.component.i18n.xml
│       │   │   ├── shared/
│       │   │   │   └── common.i18n.json
│       │   │   ├── app.component.ts
│       │   │   ├── app.config.ts
│       │   │   └── app.routes.ts
│       │   └── locale/
│       │       ├── translations.json     # Merged mode source
│       │       ├── messages.xlf          # Generated
│       │       ├── messages.es.xlf       # Generated
│       │       ├── messages.fr.xlf       # Generated
│       │       └── messages.de.xlf       # Generated
│       ├── angular.json
│       └── package.json
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Core Concept: Two Operating Modes

The library supports **two extraction modes** to accommodate different project needs:

### Mode 1: Per-Component (Default)

One translation file per component template - perfect co-location.

### Mode 2: Merged

Single translation file containing all keys from all templates - like standard Angular i18n but with our all-in-one format.

---

## Translation File Format

### All-in-One Format (Development)

**The key innovation:** All translations for a single key live together.

#### JSON Format (Primary)

```json
{
  "welcome": {
    "en": "Welcome",
    "es": "Bienvenido",
    "fr": "Bienvenue",
    "de": "Willkommen"
  },
  "greeting": {
    "en": "Hello {{name}}!",
    "es": "¡Hola {{name}}!",
    "fr": "Bonjour {{name}}!",
    "de": "Hallo {{name}}!"
  },
  "user.profile.title": {
    "en": "Profile Settings",
    "es": "Configuración del Perfil",
    "fr": "Paramètres du Profil",
    "de": "Profileinstellungen"
  },
  "items.count": {
    "en": "{count, plural, =0 {No items} =1 {One item} other {{{count}} items}}",
    "es": "{count, plural, =0 {Sin elementos} =1 {Un elemento} other {{{count}} elementos}}",
    "fr": "{count, plural, =0 {Aucun élément} =1 {Un élément} other {{{count}} éléments}}"
  }
}
```

#### XML Format (Alternative)

```xml
<translations>
  <translation key="welcome">
    <en>Welcome</en>
    <es>Bienvenido</es>
    <fr>Bienvenue</fr>
    <de>Willkommen</de>
  </translation>

  <translation key="greeting">
    <en>Hello {{name}}!</en>
    <es>¡Hola {{name}}!</es>
    <fr>Bonjour {{name}}!</fr>
    <de>Hallo {{name}}!</de>
  </translation>

  <translation key="user.profile.title">
    <en>Profile Settings</en>
    <es>Configuración del Perfil</es>
    <fr>Paramètres du Profil</fr>
    <de>Profileinstellungen</de>
  </translation>
</translations>
```

### Production Output (Angular Standard)

The tool generates **Angular-compatible XLIFF formats**.

#### XLIFF 2.0 Format (Recommended)

```xml
<!-- messages.en.xlf -->
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file id="ngi18n" original="ng.template">
    <unit id="welcome">
      <segment>
        <source>Welcome</source>
      </segment>
    </unit>
    <unit id="greeting">
      <segment>
        <source>Hello <ph id="0" equiv="INTERPOLATION" disp="{{name}}"/>!</source>
      </segment>
    </unit>
  </file>
</xliff>
```

```xml
<!-- messages.es.xlf -->
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="es">
  <file id="ngi18n" original="ng.template">
    <unit id="welcome">
      <segment>
        <source>Welcome</source>
        <target>Bienvenido</target>
      </segment>
    </unit>
    <unit id="greeting">
      <segment>
        <source>Hello <ph id="0" equiv="INTERPOLATION" disp="{{name}}"/>!</source>
        <target>¡Hola <ph id="0" equiv="INTERPOLATION" disp="{{name}}"/>!</target>
      </segment>
    </unit>
  </file>
</xliff>
```

---

## Mode 1: Per-Component Workflow

### File Structure

```
src/app/
├── home/
│   ├── home.component.ts
│   ├── home.component.html        ← Template
│   └── home.component.i18n.json   ← Translations for THIS template
├── features/
│   ├── user-profile/
│   │   ├── user-profile.component.ts
│   │   ├── user-profile.component.html
│   │   └── user-profile.component.i18n.json
│   └── settings/
│       ├── settings.component.ts
│       ├── settings.component.html
│       └── settings.component.i18n.xml
└── locale/
    ├── messages.xlf         ← Generated by export
    ├── messages.es.xlf
    ├── messages.fr.xlf
    └── messages.de.xlf
```

### Complete Workflow

**Step 1: Create Component with i18n**

```html
<!-- home.component.html -->
<h1 i18n="@@welcome">Welcome</h1>
<p i18n="@@home.subtitle">Your personal dashboard</p>
<button i18n="@@home.action">Get Started</button>
```

**Step 2: Extract Translations**

```bash
ng run demo-app:extract-i18n
```

**What happens internally:**

1. Builder calls Angular's native `extract-i18n` on each template
2. Parses the generated XLIFF output
3. Creates `home.component.i18n.json` next to the template
4. Pre-fills with source language, empty target languages

**Console Output:**

```
🔍 Extracting in per-component mode...
✓ home.component.html → home.component.i18n.json
  - Added 3 keys (welcome, home.subtitle, home.action)
✓ user-profile.component.html → user-profile.component.i18n.json
  - Added 5 keys
✓ settings.component.html → settings.component.i18n.xml
  - Added 2 keys

📊 Total: 10 keys extracted across 3 components
⚠️  Missing translations for: es (10), fr (10), de (10)
```

**Generated File:**

```json
// home.component.i18n.json
{
  "welcome": {
    "en": "Welcome",
    "es": "",
    "fr": "",
    "de": ""
  },
  "home.subtitle": {
    "en": "Your personal dashboard",
    "es": "",
    "fr": "",
    "de": ""
  },
  "home.action": {
    "en": "Get Started",
    "es": "",
    "fr": "",
    "de": ""
  }
}
```

**Step 3: Add Translations**

Edit the generated file:

```json
// home.component.i18n.json
{
  "welcome": {
    "en": "Welcome",
    "es": "Bienvenido",
    "fr": "Bienvenue",
    "de": "Willkommen"
  },
  "home.subtitle": {
    "en": "Your personal dashboard",
    "es": "Tu panel personal",
    "fr": "Votre tableau de bord personnel",
    "de": "Ihr persönliches Dashboard"
  },
  "home.action": {
    "en": "Get Started",
    "es": "Comenzar",
    "fr": "Commencer",
    "de": "Loslegen"
  }
}
```

**Step 4: Export to XLIFF**

```bash
ng run demo-app:i18n-export
```

**What happens:**

1. Scans all `*.i18n.json` and `*.i18n.xml` files
2. Merges all translations
3. Generates XLIFF files per language
4. Validates completeness

**Console Output:**

```
🔄 Exporting translations...
✓ Collected 10 keys from 3 files
✓ Generated: src/locale/messages.xlf
✓ Generated: src/locale/messages.es.xlf (100% complete)
✓ Generated: src/locale/messages.fr.xlf (100% complete)
✓ Generated: src/locale/messages.de.xlf (100% complete)
```

**Step 5: Build Application**

```bash
ng build --localize
```

Angular's compiler uses the generated XLIFF files to create localized builds.

**Output:**

```
dist/demo-app/
├── browser/
│   ├── en/       ← English build
│   ├── es/       ← Spanish build
│   ├── fr/       ← French build
│   └── de/       ← German build
```

### Re-extraction (Template Updates)

When you modify a template and re-run extract:

```bash
ng run demo-app:extract-i18n
```

**Merge behavior:**

- **New keys** → Added with empty translations
- **Existing keys** → Preserved translations retained
- **Removed keys** → Flagged as unused (optional cleanup with `--clean`)
- **Updated source text** → Source updated, translations preserved, warning logged

**Console Output:**

```
✓ Updated: home.component.i18n.json
  - Added: home.newFeature (needs translation: es, fr, de)
  - Removed: home.oldAction (use --clean to remove)
  - Updated source: welcome ("Welcome" → "Welcome!")
  - Preserved: 2 existing translations
```

---

## Mode 2: Merged Workflow

### File Structure

```
src/
├── app/
│   ├── home/
│   │   ├── home.component.ts
│   │   └── home.component.html
│   ├── profile/
│   │   ├── profile.component.ts
│   │   └── profile.component.html
│   └── settings/
│       ├── settings.component.ts
│       └── settings.component.html
└── locale/
    ├── translations.json    ← ONE big file (source)
    ├── messages.xlf         ← Generated
    ├── messages.es.xlf
    ├── messages.fr.xlf
    └── messages.de.xlf
```

### Complete Workflow

**Step 1: Configure for Merged Mode**

```json
// angular.json
{
  "extract-i18n": {
    "builder": "@gridatek/ngx-i18n-tools:extract",
    "options": {
      "mode": "merged",
      "outputFile": "src/locale/translations.json"
    }
  }
}
```

**Step 2: Extract Translations**

```bash
ng run demo-app:extract-i18n
```

**What happens internally:**

1. Builder calls Angular's native `extract-i18n` on all templates
2. Parses the generated XLIFF
3. Creates or updates single `translations.json` file
4. Groups all keys from all components

**Console Output:**

```
🔍 Extracting in merged mode...
✓ Scanned 3 templates
✓ Extracted 10 keys total
✓ Generated: src/locale/translations.json

📊 Keys by component:
  - home: 3 keys
  - profile: 5 keys
  - settings: 2 keys

⚠️  Missing translations for: es (10), fr (10), de (10)
```

**Generated File:**

```json
// src/locale/translations.json
{
  "welcome": {
    "en": "Welcome",
    "es": "",
    "fr": "",
    "de": ""
  },
  "home.subtitle": {
    "en": "Your personal dashboard",
    "es": "",
    "fr": "",
    "de": ""
  },
  "profile.title": {
    "en": "User Profile",
    "es": "",
    "fr": "",
    "de": ""
  },
  "profile.edit": {
    "en": "Edit Profile",
    "es": "",
    "fr": "",
    "de": ""
  },
  "settings.title": {
    "en": "Settings",
    "es": "",
    "fr": "",
    "de": ""
  }
  // ... all keys in one place
}
```

**Step 3: Add Translations**

Edit the single file:

```json
// src/locale/translations.json
{
  "welcome": {
    "en": "Welcome",
    "es": "Bienvenido",
    "fr": "Bienvenue",
    "de": "Willkommen"
  },
  "home.subtitle": {
    "en": "Your personal dashboard",
    "es": "Tu panel personal",
    "fr": "Votre tableau de bord personnel",
    "de": "Ihr persönliches Dashboard"
  }
  // ... all translations together
}
```

**Step 4: Export to XLIFF**

```bash
ng run demo-app:i18n-export
```

**Console Output:**

```
🔄 Exporting translations...
✓ Loaded 10 keys from translations.json
✓ Generated: src/locale/messages.xlf
✓ Generated: src/locale/messages.es.xlf (100% complete)
✓ Generated: src/locale/messages.fr.xlf (100% complete)
✓ Generated: src/locale/messages.de.xlf (100% complete)
```

**Step 5: Build Application**

```bash
ng build --localize
```

---

## Angular Component Usage

### Template Syntax

Use Angular's standard `i18n` attributes with message IDs:

```html
<!-- Standard i18n attribute with ID -->
<h1 i18n="@@welcome">Welcome</h1>

<!-- With description and meaning -->
<p i18n="User greeting message|@@greeting">Hello {{userName}}!</p>

<!-- Plural forms (ICU syntax) -->
<span i18n="@@items.count">
  {count, plural, =0 {No items} =1 {One item} other {{{count}} items} }
</span>

<!-- Attributes -->
<img [src]="logoUrl" i18n-alt="@@logo.alt" alt="Company Logo" />

<!-- Multiple attributes -->
<input
  type="text"
  i18n-placeholder="@@search.placeholder"
  placeholder="Search..."
  i18n-title="@@search.title"
  title="Enter search terms"
/>
```

### Using $localize (TypeScript)

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: '<p>{{ message }}</p>',
})
export class ExampleComponent {
  // Simple localization
  message = $localize`:@@welcome:Welcome`;

  // With interpolation
  greetUser(name: string) {
    return $localize`:@@greeting:Hello ${name}!`;
  }

  // With description and meaning
  title = $localize`:Page title|Main page heading@@home.title:Home Page`;
}
```

---

## Configuration

### angular.json - Per-Component Mode (Default)

```json
{
  "projects": {
    "demo-app": {
      "architect": {
        "extract-i18n": {
          "builder": "@gridatek/ngx-i18n-tools:extract",
          "options": {
            "mode": "per-component",
            "templatePattern": "src/**/*.component.html",
            "translationFileNaming": "{component}.i18n.json",
            "translationFormat": "json",
            "sourceLocale": "en",
            "targetLocales": ["es", "fr", "de"],
            "preserveExisting": true,
            "cleanUnused": false,
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
        "build": {
          "options": {
            "localize": ["en", "es", "fr", "de"],
            "i18nMissingTranslation": "warning"
          }
        }
      },
      "i18n": {
        "sourceLocale": "en",
        "locales": {
          "es": "src/locale/messages.es.xlf",
          "fr": "src/locale/messages.fr.xlf",
          "de": "src/locale/messages.de.xlf"
        }
      }
    }
  }
}
```

### angular.json - Merged Mode

```json
{
  "projects": {
    "demo-app": {
      "architect": {
        "extract-i18n": {
          "builder": "@gridatek/ngx-i18n-tools:extract",
          "options": {
            "mode": "merged",
            "templatePattern": "src/**/*.component.html",
            "outputFile": "src/locale/translations.json",
            "outputFormat": "json",
            "sourceLocale": "en",
            "targetLocales": ["es", "fr", "de"],
            "preserveExisting": true,
            "sortKeys": true,
            "validateInterpolations": true
          }
        },
        "i18n-export": {
          "builder": "@gridatek/ngx-i18n-tools:export",
          "options": {
            "source": "src/locale/translations.json",
            "outputPath": "src/locale",
            "format": "xliff2",
            "sourceLocale": "en",
            "targetLocales": ["es", "fr", "de"]
          }
        }
      }
    }
  }
}
```

---

## Builder Architecture

### Extract Builder (Core)

The extract builder **wraps Angular's native extract-i18n** and converts output to our format.

```typescript
// builders/extract-builder.ts
import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { spawn } from 'child_process';
import { JsonObject } from '@angular-devkit/core';

interface ExtractBuilderOptions extends JsonObject {
  mode: 'per-component' | 'merged';
  templatePattern: string;
  translationFileNaming?: string; // For per-component mode
  outputFile?: string; // For merged mode
  outputFormat: 'json' | 'xml';
  sourceLocale: string;
  targetLocales: string[];
  preserveExisting: boolean;
  cleanUnused: boolean;
  validateInterpolations: boolean;
  sortKeys?: boolean;
}

export default createBuilder<ExtractBuilderOptions>(
  async (options: ExtractBuilderOptions, context: BuilderContext): Promise<BuilderOutput> => {
    context.logger.info(`🔍 Extracting in ${options.mode} mode...`);

    // Step 1: Run Angular's native extract-i18n
    const tempXliffPath = 'temp/messages.xlf';
    const angularResult = await runAngularExtractI18n(context, tempXliffPath);

    if (!angularResult.success) {
      return { success: false, error: 'Angular extraction failed' };
    }

    context.logger.info('✓ Template extraction complete');

    // Step 2: Convert based on mode
    if (options.mode === 'per-component') {
      return await extractPerComponent(options, context, tempXliffPath);
    } else {
      return await extractMerged(options, context, tempXliffPath);
    }
  },
);

async function runAngularExtractI18n(
  context: BuilderContext,
  outputPath: string,
): Promise<BuilderOutput> {
  // Execute Angular's built-in extract-i18n
  return new Promise((resolve) => {
    const ng = spawn('ng', ['extract-i18n', '--format=xliff2', `--output-path=${outputPath}`], {
      stdio: 'inherit',
    });

    ng.on('close', (code) => {
      resolve({ success: code === 0 });
    });
  });
}

async function extractPerComponent(
  options: ExtractBuilderOptions,
  context: BuilderContext,
  xliffPath: string,
): Promise<BuilderOutput> {
  // 1. Find all component templates
  const templates = await findTemplates(options.templatePattern);

  // 2. Parse XLIFF to get all extracted messages
  const extractedMessages = await parseXliff(xliffPath);

  // 3. Group messages by source file (component)
  const messagesByComponent = groupMessagesByComponent(extractedMessages);

  // 4. For each component, create/update .i18n.json file
  for (const [componentPath, messages] of messagesByComponent) {
    const translationFilePath = getTranslationFilePath(
      componentPath,
      options.translationFileNaming,
    );

    // Load existing translations if present
    const existing = await loadExistingTranslations(translationFilePath);

    // Merge new extractions with existing translations
    const merged = mergeTranslations(messages, existing, options);

    // Write translation file
    await writeTranslationFile(translationFilePath, merged, options.outputFormat);

    context.logger.info(`✓ ${componentPath} → ${translationFilePath}`);
  }

  // 5. Clean up temp files
  await cleanupTempFiles([xliffPath]);

  return { success: true };
}

async function extractMerged(
  options: ExtractBuilderOptions,
  context: BuilderContext,
  xliffPath: string,
): Promise<BuilderOutput> {
  // 1. Parse XLIFF to get all extracted messages
  const extractedMessages = await parseXliff(xliffPath);

  // 2. Load existing translations if present
  const existing = await loadExistingTranslations(options.outputFile!);

  // 3. Merge all messages into single structure
  const merged = mergeTranslations(extractedMessages, existing, options);

  // 4. Write single translation file
  await writeTranslationFile(options.outputFile!, merged, options.outputFormat);

  context.logger.info(`✓ Generated: ${options.outputFile}`);

  // 5. Clean up temp files
  await cleanupTempFiles([xliffPath]);

  return { success: true };
}
```

### Export Builder

Converts all-in-one format back to XLIFF for Angular's build.

```typescript
// builders/export-builder.ts
interface ExportBuilderOptions extends JsonObject {
  source?: string; // For merged mode
  translationPattern?: string; // For per-component mode
  outputPath: string;
  format: 'xliff' | 'xliff2';
  sourceLocale: string;
  targetLocales: string[];
}

export default createBuilder<ExportBuilderOptions>(
  async (options: ExportBuilderOptions, context: BuilderContext): Promise<BuilderOutput> => {
    context.logger.info('🔄 Exporting translations...');

    // Step 1: Collect all translation files
    let allTranslations: TranslationMap;

    if (options.source) {
      // Merged mode: single file
      allTranslations = await loadTranslationFile(options.source);
    } else {
      // Per-component mode: scan and merge
      const files = await findTranslationFiles(options.translationPattern!);
      allTranslations = await mergeAllTranslationFiles(files);
    }

    context.logger.info(`✓ Collected ${Object.keys(allTranslations).length} keys`);

    // Step 2: Validate translations
    const validation = validateTranslations(allTranslations, options.targetLocales);
    if (!validation.valid) {
      logValidationErrors(validation, context);
      return { success: false, error: 'Validation failed' };
    }

    // Step 3: Generate XLIFF files per language
    for (const locale of [options.sourceLocale, ...options.targetLocales]) {
      const xliffContent = generateXliff(
        allTranslations,
        options.sourceLocale,
        locale,
        options.format,
      );

      const outputFile = `${options.outputPath}/messages.${locale}.xlf`;
      await writeFile(outputFile, xliffContent);

      context.logger.info(`✓ Generated: ${outputFile}`);
    }

    return { success: true };
  },
);
```

---

## Switching Between Modes

### From Per-Component → Merged

```bash
ng run demo-app:i18n-merge-all
```

**What it does:**

- Scans all `*.i18n.json` files
- Merges into single `translations.json`
- Preserves all translations
- Keeps original files (manual cleanup needed)

**Console Output:**

```
🔄 Merging all component translations...
✓ home.component.i18n.json (3 keys)
✓ user-profile.component.i18n.json (5 keys)
✓ settings.component.i18n.json (2 keys)
✓ Created: src/locale/translations.json (10 keys)

⚠️  Original component files preserved.
    Delete manually if no longer needed.
```

### From Merged → Per-Component

```bash
ng run demo-app:i18n-split
```

**What it does:**

- Reads single `translations.json`
- Maps keys back to component templates (requires template analysis)
- Creates individual `.i18n.json` files
- Keeps original file (manual cleanup needed)

**Console Output:**

```
🔄 Splitting translations by component...
✓ Created: home.component.i18n.json (3 keys)
✓ Created: user-profile.component.i18n.json (5 keys)
✓ Created: settings.component.i18n.json (2 keys)

⚠️  Original translations.json preserved.
    Delete manually if no longer needed.
```

---

## Additional Builders

### Validate Builder

```bash
ng run demo-app:i18n-validate
```

**Checks:**

- All templates have corresponding translations
- All translation keys exist in templates
- All target locales present for each key
- Interpolation placeholders match across languages
- No duplicate keys across files

**Console Output:**

```
🔍 Validating translations...

✓ All templates have translation files
✓ All keys valid
✓ Interpolations consistent

⚠️  Warnings:
  - home.component: Missing 'de' translation for 'welcome'
  - profile.component: Key 'old.feature' not found in template

❌ Errors:
  - settings.component: Interpolation mismatch
    en: "Hello {{name}}"
    es: "Hola {{nombre}}"

Validation: FAILED with 1 error, 2 warnings
```

### Report Builder

```bash
ng run demo-app:i18n-report
```

**Generates:**

- Translation coverage by component
- Translation coverage by language
- Missing translations
- Unused keys
- Statistics

**Console Output:**

```
📊 Translation Coverage Report
==============================

Overall: 85% complete (34/40 translations)

By Component:
  ✓ home.component: 100% (12/12)
  ⚠ profile.component: 67% (10/15)
    Missing: es, fr for "profile.newFeature"
  ✓ settings.component: 100% (12/12)

By Language:
  ✓ English (en): 100% (source language)
  ⚠ Spanish (es): 80% (32/40)
  ⚠ French (fr): 75% (30/40)
  ✓ German (de): 90% (36/40)

Unused Keys:
  - home.oldFeature (not found in templates)

Statistics:
  Total keys: 10
  Total translations: 40 (10 keys × 4 languages)
  Complete: 34
  Missing: 6
```

---

## TypeScript Interfaces

```typescript
// types/index.ts

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
```

---

## Validation & Error Handling

### Duplicate Key Detection

```
❌ ERROR: Duplicate key "welcome" found in:
  - src/app/home/home.component.i18n.json
  - src/app/shared/common.i18n.json

Resolution:
  - Use unique keys (e.g., "home.welcome" vs "shared.welcome")
  - Or merge files if they should share translations
```

### Missing Translation Warning

```
⚠️  WARNING: Key "user.profile.title" is missing translations for:
  - de (German)
  - fr (French)

File: src/app/profile/profile.component.i18n.json
Action: Add missing translations or run with --allow-incomplete
```

### Interpolation Mismatch

```
❌ ERROR: Interpolation placeholders don't match for key "greeting"

Source (en): "Hello {{name}}!"
Target (es): "¡Hola {{nombre}}!"

Issue: Placeholder names must match exactly
Expected: {{name}}
Found: {{nombre}}

File: src/app/home/home.component.i18n.json
```

### Template-Translation Mismatch

```
⚠️  WARNING: Key "old.feature" in translation file not found in template

File: src/app/home/home.component.i18n.json
Template: src/app/home/home.component.html

Action: Remove unused key or run with --clean-unused
```

### Invalid Format

```
❌ ERROR: Invalid JSON format

File: src/app/home/home.component.i18n.json
Line 5, Column 12: Unexpected token '}' in JSON

Please fix the JSON syntax.
```

---

## Testing Requirements

### Unit Tests

**Parsers**

- ✅ Parse XLIFF 2.0 correctly
- ✅ Parse XLIFF 1.2 correctly
- ✅ Handle invalid XLIFF gracefully
- ✅ Parse JSON translation files
- ✅ Parse XML translation files
- ✅ Extract interpolation placeholders
- ✅ Handle special characters and escaping

**Converters**

- ✅ Convert XLIFF → JSON all-in-one format
- ✅ Convert JSON all-in-one → XLIFF
- ✅ Preserve interpolation placeholders
- ✅ Preserve plural forms (ICU syntax)
- ✅ Handle nested keys correctly

**Validators**

- ✅ Detect duplicate keys
- ✅ Detect missing translations
- ✅ Validate interpolation consistency
- ✅ Validate placeholder names match
- ✅ Detect template-translation mismatches

**Mergers**

- ✅ Merge multiple translation files
- ✅ Preserve existing translations
- ✅ Add new keys with empty translations
- ✅ Handle key conflicts
- ✅ Maintain key order (optional)

**Builders**

- ✅ Extract builder wraps Angular correctly
- ✅ Per-component mode creates correct files
- ✅ Merged mode creates single file
- ✅ Export builder generates valid XLIFF
- ✅ Validate builder catches all issues

### Integration Tests

**Full Extraction Flow**

- ✅ Extract from templates → generate translation files
- ✅ Re-extract preserves existing translations
- ✅ Re-extract adds new keys
- ✅ Re-extract detects removed keys

**Full Export Flow**

- ✅ Export creates valid XLIFF for all languages
- ✅ Angular build succeeds with exported XLIFF
- ✅ Translations appear correctly in built app

**Mode Switching**

- ✅ Convert per-component → merged successfully
- ✅ Convert merged → per-component successfully
- ✅ No data loss during conversion

**Watch Mode**

- ✅ Watch detects template changes
- ✅ Re-extracts only changed components
- ✅ Updates are incremental and fast

### Demo App Tests

**Component Translations**

- ✅ All i18n markers have corresponding translations
- ✅ All languages render correctly
- ✅ Interpolations work (variables display)
- ✅ Plurals work (ICU syntax)
- ✅ Attribute translations work (alt, title, etc.)

**Build Tests**

- ✅ All locales build without errors
- ✅ Correct file structure in dist/
- ✅ Bundle sizes reasonable per locale
- ✅ No missing translation warnings in console

**End-to-End**

- ✅ Add new component → extract → translate → build → verify
- ✅ Update existing component → re-extract → verify merge → build
- ✅ Switch language at build time → verify correct locale loads

---

## Demo Application Requirements

### Structure

The demo app should have **3+ components** showcasing different scenarios:

```
demo-app/
├── home/ (per-component mode)
│   ├── home.component.html
│   └── home.component.i18n.json
├── features/
│   ├── user-profile/ (per-component mode)
│   │   ├── user-profile.component.html
│   │   └── user-profile.component.i18n.json
│   └── settings/ (XML format)
│       ├── settings.component.html
│       └── settings.component.i18n.xml
└── locale/
    ├── translations.json (optional: merged mode example)
    └── messages.*.xlf (generated)
```

### Features to Demonstrate

**Home Component:**

- Simple text translation
- Greeting with interpolation: `Hello {{userName}}`
- Plural forms: item count
- Language switcher UI

**User Profile Component:**

- Nested keys: `profile.edit`, `profile.settings`, `profile.logout`
- Form labels and validation messages
- Attribute translations (placeholders, titles)

**Settings Component:**

- XML format demonstration
- Complex interpolations
- ICU plural/select syntax

**Shared/Common:**

- Header/footer translations
- Navigation menu
- Common buttons (Save, Cancel, Delete)
- Error messages

### Language Switcher

```typescript
// language-switcher.component.ts
@Component({
  selector: 'app-language-switcher',
  template: `
    <select (change)="switchLanguage($event)">
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
      <option value="de">Deutsch</option>
    </select>
  `,
})
export class LanguageSwitcherComponent {
  switchLanguage(event: Event) {
    const locale = (event.target as HTMLSelectElement).value;
    window.location.href = `/${locale}/`;
  }
}
```

### Build Configurations

```json
// angular.json
{
  "configurations": {
    "development": {
      "localize": false
    },
    "en": {
      "localize": ["en"]
    },
    "es": {
      "localize": ["es"]
    },
    "fr": {
      "localize": ["fr"]
    },
    "de": {
      "localize": ["de"]
    },
    "production": {
      "localize": true,
      "outputPath": "dist/demo-app"
    }
  }
}
```

### NPM Scripts

```json
{
  "scripts": {
    "i18n:extract": "ng run demo-app:extract-i18n",
    "i18n:extract:merged": "ng run demo-app:extract-i18n --mode=merged",
    "i18n:export": "ng run demo-app:i18n-export",
    "i18n:sync": "npm run i18n:extract && npm run i18n:export",
    "i18n:validate": "ng run demo-app:i18n-validate",
    "i18n:report": "ng run demo-app:i18n-report",
    "i18n:watch": "ng run demo-app:extract-i18n --watch",
    "serve": "ng serve",
    "serve:en": "ng serve --configuration=en",
    "serve:es": "ng serve --configuration=es",
    "serve:fr": "ng serve --configuration=fr",
    "serve:de": "ng serve --configuration=de",
    "build": "ng build --localize",
    "build:en": "ng build --configuration=en",
    "build:es": "ng build --configuration=es"
  }
}
```

---

## Installation & Setup

### For End Users

```bash
# Install the library
npm install @gridatek/ngx-i18n-tools --save-dev

# Run setup schematic
ng add @gridatek/ngx-i18n-tools
```

### What `ng add` Should Do

1. **Update `angular.json`**
   - Add extract-i18n builder configuration
   - Add export builder configuration
   - Configure i18n settings
   - Add serve configurations per locale

2. **Create Initial Files**
   - Create `src/locale/` directory
   - Create initial `translations.json` (if merged mode)
   - Add `.gitignore` entries for generated files

3. **Update `package.json`**
   - Add npm scripts for i18n commands

4. **Display Instructions**

   ```
   ✓ @gridatek/ngx-i18n-tools installed successfully!

   Next steps:
   1. Add i18n markers to your templates:
      <h1 i18n="@@welcome">Welcome</h1>

   2. Extract translations:
      npm run i18n:extract

   3. Fill in translations in generated files

   4. Export to XLIFF:
      npm run i18n:export

   5. Build with localization:
      npm run build

   Documentation: https://github.com/gridatek/ngx-i18n-tools
   ```

---

## Development Workflow

### Library Development

```bash
# Terminal 1: Build library in watch mode
ng build gridatek-ngx-i18n-tools --watch

# Terminal 2: Run unit tests
ng test gridatek-ngx-i18n-tools --watch

# Run linter
ng lint gridatek-ngx-i18n-tools
```

### Demo App Development

```bash
# Terminal 1: Build library
npm run build:lib:watch

# Terminal 2: Extract translations (watch)
npm run i18n:watch

# Terminal 3: Serve demo app
npm run serve:demo
```

### Full Development Cycle

```bash
# 1. Make changes to library code
# 2. Library rebuilds automatically (watch mode)
# 3. Test in demo app
npm run serve:demo

# 4. Make template changes
# 5. Extract updates automatically (watch mode)
# 6. Fill translations
# 7. Export
npm run i18n:export

# 8. Verify
npm run serve:es
```

---

## Publishing

### Pre-publish Checklist

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Demo app builds successfully for all locales
- [ ] README.md complete with examples
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] License file present (MIT)
- [ ] Documentation reviewed
- [ ] Schematics tested with `ng add`

### Publish Commands

```bash
# Build library for production
ng build gridatek-ngx-i18n-tools --configuration=production

# Navigate to dist
cd dist/gridatek-ngx-i18n-tools

# Verify package contents
npm pack --dry-run

# Publish to npm
npm publish --access public
```

---

## Comparison: Per-Component vs Merged

| Feature            | Per-Component                               | Merged                         |
| ------------------ | ------------------------------------------- | ------------------------------ |
| **File count**     | Many (one per component)                    | One                            |
| **Co-location**    | ✅ Perfect - translations next to templates | ❌ Separate directory          |
| **Team conflicts** | ✅ Minimal - isolated files                 | ⚠️ Possible on single file     |
| **Overview**       | ⚠️ Must check multiple files                | ✅ See all keys in one place   |
| **Lazy loading**   | ✅ Easy per-route splitting                 | ⚠️ Harder to split             |
| **Migration**      | ⚠️ New file structure                       | ✅ Similar to standard Angular |
| **Discovery**      | ✅ Obvious which file to edit               | ⚠️ Must search in large file   |
| **Code review**    | ✅ See template + translation together      | ⚠️ Separate files              |
| **Best for**       | Large teams, many components                | Small/medium apps, single team |

**Important:** Both modes produce **identical XLIFF output** for Angular's build system!

---

## Success Criteria

The library is successful when:

1. ✅ Developers can see all translations for a key together
2. ✅ Zero configuration for simple use cases
3. ✅ Full compatibility with Angular's native i18n
4. ✅ Works with Angular Universal (SSR)
5. ✅ Clear error messages and validation
6. ✅ Fast build times (wraps Angular, doesn't reparse)
7. ✅ Supports all Angular i18n features (plurals, ICU, interpolation)
8. ✅ Easy migration from standard Angular i18n
9. ✅ Works in watch mode for rapid development
10. ✅ Production builds identical to standard Angular

---

## Future Enhancements (Post v1.0)

- Translation management UI (web interface)
- Integration with translation services (Lokalise, Crowdin, Phrase)
- AI-powered translation suggestions
- Translation memory across projects
- Visual context for translators (screenshot integration)
- A/B testing for translations
- Analytics for translation usage
- Git hooks for automatic extraction
- CI/CD integration examples
- VS Code extension for inline translation editing

---

## Technical Constraints

- **Minimum Angular Version:** 17.0.0 (standalone components, new i18n)
- **Node Version:** >=18.0.0
- **TypeScript Version:** >=5.0.0
- **Output Formats:** Must be 100% compatible with Angular's compiler
- **XLIFF Versions:** Support both 1.2 and 2.0
- **Performance:** Must not significantly impact build time

---

## Open Questions

1. **Namespace support:** Should we support translation namespaces/contexts?
2. **Comments for translators:** How to preserve translator notes from templates?
3. **Conditional translations:** Platform-specific translations (web vs mobile)?
4. **RTL languages:** Special handling needed?
5. **Source control:** Should generated XLIFF files be committed?
6. **Hot reload:** Can we integrate with Angular's dev server for live translation updates?

---

## License

MIT License (or as specified by Gridatek)

---

## Contact & Support

- **Repository:** https://github.com/gridatek/ngx-i18n-tools
- **Issues:** https://github.com/gridatek/ngx-i18n-tools/issues
- **Documentation:** https://gridatek.github.io/ngx-i18n-tools
- **NPM:** https://www.npmjs.com/package/@gridatek/ngx-i18n-tools
- **Author:** Gridatek Team

---

## Summary

`@gridatek/ngx-i18n-tools` enhances Angular's i18n by:

1. **Wrapping** Angular's extract-i18n (not replacing it)
2. **Converting** output to developer-friendly all-in-one format
3. **Supporting** two modes: per-component (co-located) or merged (single file)
4. **Generating** standard XLIFF that Angular's build system expects
5. **Validating** translations comprehensively
6. **Simplifying** the translation workflow

**Result:** Better developer experience while maintaining 100% Angular compatibility.
