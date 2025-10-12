# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of `@gridatek/ngx-i18n-tools`
- Extract builder that wraps Angular's native `extract-i18n`
- Export builder to convert all-in-one format to XLIFF
- Validate builder for comprehensive translation validation
- Merge builder to convert per-component files to merged format
- Split builder to convert merged format to per-component files
- Support for both per-component and merged modes
- All-in-one translation format (JSON and XML)
- XLIFF 1.2 and 2.0 generation
- Interpolation placeholder validation
- Duplicate key detection
- Translation coverage statistics
- `ng add` schematic for easy setup
- Demo application showcasing both modes
- Comprehensive documentation

### Features

- Work seamlessly with Angular's native i18n system
- Preserve existing translations during re-extraction
- Automatic merging of new and existing translations
- Support for ICU syntax (plurals, select)
- TypeScript type definitions for all APIs

## [1.0.0] - YYYY-MM-DD

### Added

- Initial stable release

[Unreleased]: https://github.com/gridatek/ngx-i18n-tools/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/gridatek/ngx-i18n-tools/releases/tag/v1.0.0
