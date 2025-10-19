# @gridatek/ngx-i18n-tools

Angular i18n tooling library that provides a superior developer experience by allowing all translations for a single key to be stored together during development, then converting to Angular's standard XLIFF formats for production builds.

## Features

- **All-in-one translation format**: See all language translations together
- **Two operating modes**: Per-component (co-located) or merged (single file)
- **100% Angular compatible**: Works seamlessly with Angular's native i18n
- **Comprehensive validation**: Catch translation errors early
- **Automatic merging**: Re-extraction preserves existing translations

## Installation

```bash
npm install @gridatek/ngx-i18n-tools --save-dev
ng add @gridatek/ngx-i18n-tools
```

## Quick Start

### 1. Mark your templates with i18n

```html
<h1 i18n="@@welcome">Welcome</h1>
<p i18n="@@greeting">Hello {{name}}!</p>
```

### 2. Extract translations

```bash
ng run your-app:extract-i18n
```

### 3. Fill in translations

Edit the generated `.i18n.json` files:

```json
{
  "welcome": {
    "en": "Welcome",
    "es": "Bienvenido",
    "fr": "Bienvenue"
  }
}
```

### 4. Export to XLIFF

```bash
ng run your-app:i18n-export
```

### 5. Build with localization

```bash
ng build --localize
```

## Documentation

For complete documentation, see the [ngx-i18n-tools-doc.md](../../ngx-i18n-tools-doc.md) file.

## License

MIT
