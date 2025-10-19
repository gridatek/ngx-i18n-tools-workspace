# Testing Guide for ngx-i18n-tools

This guide explains how to test the `@gridatek/ngx-i18n-tools` library locally using the demo application.

## Quick Start

### Automated Testing Workflow

The easiest way to test the entire library is using the automated test workflow:

**On Unix/Linux/macOS or Windows with Git Bash:**

```bash
npm run test:workflow
```

**On Windows (CMD/PowerShell):**

```bash
npm run test:workflow:win
```

This will:

1. Build the library
2. Create an npm package
3. Install it locally
4. Run all builders with the demo app
5. Verify all outputs
6. Build the demo app

### Quick Test (Build + Extract + Validate)

For faster iteration during development:

```bash
npm run test:quick
```

## Manual Testing Steps

If you prefer to test step-by-step manually:

### 1. Build the Library

```bash
npm run build:lib
```

This compiles both the Angular library and the schematics.

**Expected output:**

- `dist/ngx-i18n-tools/` directory created
- Build completes in ~3-4 seconds
- Zero TypeScript errors

### 2. Install Locally

Choose one of these methods:

#### Method A: npm link (Recommended for Development)

```bash
# Create global symlink
cd dist/ngx-i18n-tools
npm link

# Link to workspace
cd ../..
npm link @gridatek/ngx-i18n-tools
```

**Advantages:**

- Changes to the build are immediately reflected
- No need to reinstall after each rebuild
- Faster iteration

#### Method B: npm pack (Realistic Testing)

```bash
# Create tarball
cd dist/ngx-i18n-tools
npm pack

# Install tarball
cd ../..
npm install ./dist/ngx-i18n-tools/gridatek-ngx-i18n-tools-1.0.0.tgz
```

**Advantages:**

- Tests the actual package that will be published
- Verifies package.json configuration
- Tests installation experience

### 3. Test Extract Builder

Extract i18n messages from templates:

```bash
npm run i18n:extract
```

**Expected behavior:**

- Scans `projects/demo-app/src/**/*.component.html` files
- Creates `*.i18n.json` files co-located with templates
- Merges with existing translations (preserves existing work)

**Verify output:**

```bash
# Unix/macOS/Git Bash
find projects/demo-app/src -name "*.i18n.json"

# Windows CMD
dir /s /b projects\demo-app\src\*.i18n.json
```

**Example output file** (`home.component.i18n.json`):

```json
{
  "welcome": {
    "source": "Welcome",
    "translations": {
      "es": "",
      "fr": "",
      "de": ""
    }
  },
  "greeting": {
    "source": "Hello {{ userName }}!",
    "translations": {
      "es": "",
      "fr": "",
      "de": ""
    }
  }
}
```

### 4. Fill in Translations (Manual Step)

Edit the generated `.i18n.json` files and add translations:

```json
{
  "welcome": {
    "source": "Welcome",
    "translations": {
      "es": "Bienvenido",
      "fr": "Bienvenue",
      "de": "Willkommen"
    }
  }
}
```

### 5. Test Validate Builder

Validate translations for completeness:

```bash
npm run i18n:validate
```

**Expected behavior:**

- Checks for missing translations
- Validates interpolation placeholders match source
- Reports duplicate keys
- Shows coverage statistics

**Example output:**

```
Validation Results:
✓ All translations are complete
✓ All interpolations are valid
✓ No duplicate keys found

Coverage:
  es: 100% (15/15)
  fr: 100% (15/15)
  de: 100% (15/15)
```

### 6. Test Export Builder

Export to XLIFF format for Angular:

```bash
npm run i18n:export
```

**Expected behavior:**

- Reads all `*.i18n.json` files
- Generates XLIFF 2.0 files in `projects/demo-app/src/locale/`
- One file per target locale: `messages.es.xlf`, `messages.fr.xlf`, etc.

**Verify output:**

```bash
ls projects/demo-app/src/locale/
```

**Expected files:**

```
messages.es.xlf
messages.fr.xlf
messages.de.xlf
```

### 7. Test Merge Builder

Convert per-component translations to merged format:

```bash
npm run i18n:merge
```

**Expected behavior:**

- Collects all `*.i18n.json` files
- Creates single file: `projects/demo-app/src/locale/translations.json`
- All translations merged into one structure

**Example merged output:**

```json
{
  "welcome": {
    "source": "Welcome",
    "translations": { "es": "Bienvenido", "fr": "Bienvenue", "de": "Willkommen" }
  },
  "greeting": {
    "source": "Hello {{ userName }}!",
    "translations": {
      "es": "Hola {{ userName }}!",
      "fr": "Bonjour {{ userName }}!",
      "de": "Hallo {{ userName }}!"
    }
  },
  "profile.title": {
    "source": "User Profile",
    "translations": {
      "es": "Perfil de Usuario",
      "fr": "Profil Utilisateur",
      "de": "Benutzerprofil"
    }
  }
}
```

### 8. Test Split Builder

Convert merged translations back to per-component:

```bash
npm run i18n:split
```

**Expected behavior:**

- Reads merged `translations.json`
- Splits back into per-component `*.i18n.json` files
- Matches keys to components based on template scanning

### 9. Build Demo App

Test that Angular can build with the generated XLIFF files:

**Development build (single locale):**

```bash
npm run build:demo -- --configuration=development
```

**Production build (all locales):**

```bash
npm run build:demo
```

**Expected output:**

```
dist/demo-app/
├── browser/           # Default locale (en)
├── es/               # Spanish
├── fr/               # French
└── de/               # German
```

### 10. Serve Demo App

Run the demo app locally:

```bash
npm run serve:demo
```

Visit `http://localhost:4200` to see the app.

## Testing Workflow Scripts

### Full Workflow Test

The automated workflow script performs comprehensive testing:

```bash
npm run test:workflow      # Unix/macOS/Git Bash
npm run test:workflow:win  # Windows CMD
```

**What it tests:**

1. ✅ Library builds successfully
2. ✅ Package structure is correct
3. ✅ npm pack creates tarball
4. ✅ Package installs correctly
5. ✅ Extract builder works
6. ✅ Validate builder works
7. ✅ Export builder works
8. ✅ Merge builder works
9. ✅ Split builder works
10. ✅ Demo app builds

**Runtime:** ~30-60 seconds

### Quick Workflow Test

For faster iteration:

```bash
npm run test:quick
```

**What it tests:**

1. ✅ Library builds
2. ✅ Extract builder works
3. ✅ Validate builder works

**Runtime:** ~10-15 seconds

## Testing Scenarios

### Scenario 1: Per-Component Mode (Default)

Test the per-component workflow:

```bash
# Extract in per-component mode (already configured)
npm run i18n:extract

# Validate
npm run i18n:validate

# Export to XLIFF
npm run i18n:export

# Build demo
npm run build:demo -- --configuration=development
```

### Scenario 2: Merged Mode

Test the merged workflow:

1. Switch demo app to merged mode in `angular.json`:

```json
"extract-i18n": {
  "options": {
    "mode": "merged",
    "outputFile": "projects/demo-app/src/locale/translations.json"
  }
}
```

2. Run workflow:

```bash
npm run i18n:extract
npm run i18n:validate
npm run i18n:export
npm run build:demo -- --configuration=development
```

### Scenario 3: Mode Conversion

Test converting between modes:

```bash
# Start with per-component
npm run i18n:extract  # Creates *.i18n.json

# Convert to merged
npm run i18n:merge    # Creates translations.json

# Convert back to per-component
npm run i18n:split    # Recreates *.i18n.json
```

## Testing the ng-add Schematic

Test the schematic installation in a separate Angular project:

```bash
# Create test project
ng new test-project
cd test-project

# Install the package
npm install /path/to/ngx-i18n-tools-workspace/dist/ngx-i18n-tools/gridatek-ngx-i18n-tools-1.0.0.tgz

# Run ng-add schematic
ng add @gridatek/ngx-i18n-tools

# Verify configuration
cat angular.json  # Should have extract-i18n, i18n-export, i18n-validate targets
cat package.json  # Should have i18n:* scripts
```

## Verification Checklist

After running the test workflow, verify:

### Build Output

- [ ] `dist/ngx-i18n-tools/package.json` exists
- [ ] `dist/ngx-i18n-tools/builders.json` exists
- [ ] `dist/ngx-i18n-tools/schematics/collection.json` exists
- [ ] `dist/ngx-i18n-tools/src/lib/builders/*.ts` files exist
- [ ] `dist/ngx-i18n-tools/src/lib/builders/*.json` schemas exist

### Installation

- [ ] `node_modules/@gridatek/ngx-i18n-tools` directory exists
- [ ] Package version matches expected version

### Extract Builder

- [ ] `*.i18n.json` files created next to templates
- [ ] JSON structure is valid
- [ ] All i18n keys are extracted
- [ ] Target locales are included

### Validate Builder

- [ ] Reports missing translations
- [ ] Validates interpolation placeholders
- [ ] Detects duplicate keys
- [ ] Shows coverage statistics

### Export Builder

- [ ] Creates `src/locale/messages.*.xlf` files
- [ ] One file per target locale
- [ ] XLIFF 2.0 format is valid
- [ ] All translations are included

### Merge Builder

- [ ] Creates `src/locale/translations.json`
- [ ] All keys from all components are included
- [ ] Structure is correct

### Split Builder

- [ ] Recreates `*.i18n.json` files
- [ ] Keys are correctly distributed to components

### Demo App Build

- [ ] Builds without errors
- [ ] Creates output for all locales
- [ ] File sizes are reasonable

## Troubleshooting

### Builder Not Found

**Error:**

```
Could not find builder "@gridatek/ngx-i18n-tools:extract"
```

**Solution:**

- Ensure package is installed: `ls node_modules/@gridatek/ngx-i18n-tools`
- Check `builders.json` exists in package
- Try unlinking and relinking with npm link

### No Translation Files Created

**Possible causes:**

1. No i18n markers in templates
2. Template pattern doesn't match files
3. Extract builder failed silently

**Solution:**

- Check templates have `i18n="@@key"` attributes
- Verify `templatePattern` in `angular.json`
- Run with verbose: `ng run demo-app:extract-i18n --verbose`

### XLIFF Files Not Generated

**Possible causes:**

1. No `.i18n.json` files exist
2. Export builder pattern doesn't match files
3. Invalid JSON in translation files

**Solution:**

- Ensure extract was run first
- Check `translationPattern` matches file locations
- Validate JSON syntax in `.i18n.json` files

### Build Fails with Locale Errors

**Error:**

```
Unable to load locale data for "es"
```

**Solution:**

- Ensure XLIFF files exist in `src/locale/`
- Check `angular.json` i18n configuration
- Verify file paths match configuration

## Performance Benchmarks

Typical execution times on a modern development machine:

| Operation                      | Time       |
| ------------------------------ | ---------- |
| Build library                  | 3-4s       |
| npm pack                       | 1s         |
| Extract (5 components)         | 2-3s       |
| Validate                       | <1s        |
| Export (3 locales)             | 1s         |
| Merge                          | <1s        |
| Split                          | 1s         |
| Build demo (dev)               | 5-8s       |
| Build demo (prod, all locales) | 20-30s     |
| **Full workflow**              | **30-60s** |

## CI/CD Testing

The library includes GitHub Actions workflows:

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and PR:

- Linting
- Library build
- Unit tests
- Demo app build
- Matrix builds (Ubuntu/Windows/macOS, Node 18/20)

### Release Workflow (`.github/workflows/release.yml`)

Runs on version tags:

- Build and publish to npm
- Deploy demo app to GitHub Pages

**Trigger a release:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Next Steps

After successful testing:

1. **Publish to npm:**

   ```bash
   cd dist/ngx-i18n-tools
   npm publish --access public
   ```

2. **Create GitHub release:**

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Update documentation:**
   - Add usage examples to README
   - Document known issues
   - Add migration guides

4. **Collect feedback:**
   - Use in real projects
   - Monitor GitHub issues
   - Iterate on features

## Support

For issues or questions:

- GitHub Issues: https://github.com/gridatek/ngx-i18n-tools/issues
- Documentation: https://github.com/gridatek/ngx-i18n-tools#readme
