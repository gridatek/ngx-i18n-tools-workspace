# ngx-i18n-tools Workspace

[![CI](https://github.com/gridatek/ngx-i18n-tools/workflows/CI/badge.svg)](https://github.com/gridatek/ngx-i18n-tools/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40gridatek%2Fngx-i18n-tools.svg)](https://www.npmjs.com/package/@gridatek/ngx-i18n-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This workspace contains the `@gridatek/ngx-i18n-tools` Angular library and a demo application.

## Project Structure

```
ngx-i18n-tools-workspace/
├── projects/
│   ├── ngx-i18n-tools/       # Main library
│   ├── schematics/            # ng add support
│   └── demo-app/              # Demo application
├── CLAUDE.md                  # Instructions for Claude Code
├── ngx-i18n-tools-doc.md     # Complete documentation
└── README.md                  # This file
```

## Quick Start

### Install Dependencies

```bash
npm install
```

### Build the Library

```bash
npm run build:lib
```

### Run the Demo App

```bash
npm run serve:demo
```

### Test i18n Workflow

**Option 1: Automated (recommended for demo/testing)**

```bash
# Complete workflow: extract + fill + export
npm run i18n:complete

# Validate translations
npm run i18n:validate

# Build the demo app with all locales
npm run build:demo
```

**Option 2: Manual (for real projects)**

```bash
# 1. Extract translations from templates
npm run i18n:extract

# 2. Edit the generated .i18n.json files to add translations manually

# 3. Export to XLIFF files
npm run i18n:export

# 4. Validate translations
npm run i18n:validate

# 5. Build the demo app with all locales
npm run build:demo
```

> **Note:** Translation files (`.i18n.json`) are now generated and not committed to git. Use `npm run i18n:fill` to auto-generate demo translations, or manually edit them after extraction.

## Development Commands

### Library Development

```bash
npm run build:lib          # Build library once
npm run build:lib:watch    # Build library in watch mode
npm run test:lib           # Run library tests
npm run lint:lib           # Lint library code
```

### Demo App Development

```bash
npm run serve:demo         # Serve demo app
npm run build:demo         # Build demo app
```

### i18n Commands

```bash
npm run i18n:extract       # Extract translations
npm run i18n:fill          # Auto-fill missing demo translations
npm run i18n:export        # Export to XLIFF
npm run i18n:sync          # Extract + Export
npm run i18n:complete      # Extract + Fill + Export
npm run i18n:validate      # Validate translations
npm run i18n:merge         # Convert per-component → merged
npm run i18n:split         # Convert merged → per-component
```

### Testing Workflow

Test the library locally with automated validation:

```bash
npm run test:workflow       # Full automated test (Unix/Git Bash)
npm run test:workflow:win   # Full automated test (Windows)
npm run test:quick          # Quick test (build + extract + validate)
npm run test:xml            # Test XML format workflow
```

The automated workflow tests all builders, validates outputs, and builds the demo app. See [TESTING.md](./TESTING.md) for detailed testing instructions.

### Unit Testing

Run unit tests for file generation scripts:

```bash
npm run test:unit           # Run all unit tests
npm run test:unit:verbose   # Run with verbose output
```

See [tests/README.md](./tests/README.md) for detailed unit testing documentation.

### E2E Testing

Run end-to-end tests with Playwright:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e            # Run all tests headless
npm run test:e2e:ui         # Run tests in UI mode
npm run test:e2e:headed     # Run tests in headed mode
npm run test:e2e:xml        # Run XML workflow E2E tests
npm run test:e2e:report     # View test report
```

See [e2e/README.md](./e2e/README.md) for detailed E2E testing documentation.

### All Tests

Run both unit and E2E tests:

```bash
npm run test:all            # Run unit tests + E2E tests
```

## Features

- **All-in-one translation format**: See all language translations together
- **Two operating modes**: Per-component or merged
- **100% Angular compatible**: Works with Angular's native i18n
- **Comprehensive validation**: Catch errors early
- **Automatic merging**: Re-extraction preserves existing translations

## Documentation

See [ngx-i18n-tools-doc.md](./ngx-i18n-tools-doc.md) for complete documentation.

## CI/CD

This project includes comprehensive CI/CD workflows:

### Continuous Integration (`.github/workflows/ci.yml`)

Runs on every push and pull request:

- **Lint**: Code quality checks
- **Build Library**: Compiles the library
- **Test Library**: Unit tests with ChromeHeadless
- **Unit Tests**: Node.js unit tests for file generation scripts
- **Build Demo**: Builds the demo application
- **E2E Workflow**: Tests the complete i18n extraction/export workflow
- **E2E Tests**: Playwright tests for multi-locale demo app
- **Test XML Format**: Complete XML workflow test (switch → extract → fill → export → validate)
- **E2E XML Tests**: Playwright tests specifically for XML workflow
- **Matrix Build**: Tests on Ubuntu, Windows, and macOS with Node 22.x
- **Code Quality**: TypeScript compilation and formatting checks

### Release Workflow (`.github/workflows/release.yml`)

Triggered on version tags (e.g., `v1.0.0`):

- Runs tests
- Builds the library
- Publishes to npm
- Creates GitHub release
- Builds and deploys demo app to GitHub Pages

### Publishing a Release

```bash
# 1. Update version in package.json
npm version patch|minor|major

# 2. Push the tag
git push origin v1.0.0

# 3. GitHub Actions will automatically publish to npm
```

## License

MIT
