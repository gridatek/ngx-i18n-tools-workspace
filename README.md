# ngx-i18n-tools Workspace

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

```bash
# 1. Extract translations from templates
npm run i18n:extract

# 2. Edit the generated .i18n.json files to add translations

# 3. Export to XLIFF files
npm run i18n:export

# 4. Validate translations
npm run i18n:validate

# 5. Build the demo app with all locales
npm run build:demo
```

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
npm run i18n:export        # Export to XLIFF
npm run i18n:sync          # Extract + Export
npm run i18n:validate      # Validate translations
```

## Features

- **All-in-one translation format**: See all language translations together
- **Two operating modes**: Per-component or merged
- **100% Angular compatible**: Works with Angular's native i18n
- **Comprehensive validation**: Catch errors early
- **Automatic merging**: Re-extraction preserves existing translations

## Documentation

See [ngx-i18n-tools-doc.md](./ngx-i18n-tools-doc.md) for complete documentation.

## License

MIT
