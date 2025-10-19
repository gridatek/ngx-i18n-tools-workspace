# Unit Tests for File Generation Scripts

This directory contains unit tests for the Node.js scripts used in the ngx-i18n-tools workflow. These tests use Node.js's built-in test runner (available in Node.js 18+).

## Test Structure

### `fill-translations.test.js`

Tests for the `scripts/fill-translations.js` script that auto-fills missing translations.

**Test Suites:**

- **JSON format**: Tests filling missing translations in `.i18n.json` files
  - Filling missing translations
  - Preserving existing translations
- **XML format**: Tests filling missing translations in `.i18n.xml` files
  - Filling missing translations
  - Handling XML special characters
- **Mixed formats**: Tests handling both JSON and XML files together

### `switch-format.test.js`

Tests for the `scripts/switch-to-xml.js` and `scripts/switch-to-json.js` scripts that switch between translation formats.

**Test Suites:**

- **switch-to-xml.js**: Tests switching to XML format
  - Updating angular.json configuration
  - Preserving other configuration options
  - Output messages
- **switch-to-json.js**: Tests switching to JSON format
  - Updating angular.json configuration
  - Preserving other configuration options
  - Output messages
- **Round-trip conversion**: Tests XML → JSON → XML integrity

## Running Tests

### All Unit Tests

```bash
npm run test:unit
```

### Verbose Output

```bash
npm run test:unit:verbose
```

### Individual Test Files

```bash
node --test tests/fill-translations.test.js
node --test tests/switch-format.test.js
```

## Test Output

Tests use Node.js built-in test runner with the following reporters:

- Default: TAP (Test Anything Protocol) format
- Verbose: Spec reporter with detailed test names and timing

Example output:

```
✔ fill-translations.js (554.47ms)
  ✔ JSON format (248.05ms)
    ✔ should fill missing translations in JSON files (148.20ms)
    ✔ should preserve existing translations (99.29ms)
  ✔ XML format (202.50ms)
    ✔ should fill missing translations in XML files (107.72ms)
    ✔ should handle XML special characters correctly (94.57ms)
  ✔ Mixed formats (101.01ms)
    ✔ should handle both JSON and XML files together (100.67ms)

✔ switch-format scripts (763.90ms)
  ✔ switch-to-xml.js (198.12ms)
    ✔ should update angular.json to use XML format (73.28ms)
    ✔ should preserve other configuration options (63.51ms)
    ✔ should output success message (60.74ms)
  ✔ switch-to-json.js (391.46ms)
    ✔ should update angular.json to use JSON format (147.59ms)
    ✔ should preserve other configuration options (117.10ms)
    ✔ should output success message (126.38ms)
  ✔ Round-trip conversion (172.37ms)
    ✔ should maintain configuration integrity through XML -> JSON -> XML (172.11ms)

ℹ tests 12
ℹ suites 8
ℹ pass 12
ℹ fail 0
```

## Test Strategy

### Unit Tests (Node.js)

- Test individual script functionality
- Test file generation and parsing
- Test configuration updates
- Fast execution (< 1 second total)

### E2E Tests (Playwright)

- Test complete workflows
- Test demo app in browser
- Test multiple locales
- Test XML workflow end-to-end
- See `../e2e/README.md` for E2E testing documentation

## CI Integration

Unit tests run in the CI pipeline:

```yaml
unit-tests:
  name: Unit Tests for Scripts
  runs-on: ubuntu-latest
  steps:
    - name: Run unit tests
      run: npm run test:unit:verbose
```

## Adding New Tests

To add new unit tests:

1. Create a new test file: `tests/your-feature.test.js`
2. Use Node.js test runner API:

```javascript
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

describe('your feature', () => {
  before(() => {
    // Setup
  });

  after(() => {
    // Cleanup
  });

  it('should do something', () => {
    const result = yourFunction();
    assert.strictEqual(result, expected);
  });
});
```

3. Run tests: `npm run test:unit`

## Test Isolation

Tests are designed to be isolated:

- Each test creates temporary directories (`temp-test-*`)
- angular.json is backed up and restored
- Tests clean up after themselves in `after()` hooks
- Tests can run in parallel

## Debugging Tests

To debug a specific test:

```bash
# Run with inspector
node --test --inspect-brk tests/fill-translations.test.js

# Run with more detailed output
node --test --test-reporter=tap tests/fill-translations.test.js
```

## Coverage

While Node.js test runner doesn't have built-in coverage, key areas tested:

- ✅ JSON parsing and generation
- ✅ XML parsing and generation
- ✅ XML entity escaping
- ✅ Configuration updates
- ✅ Translation preservation
- ✅ Mixed format handling
- ✅ Round-trip conversions

## Dependencies

No external test dependencies required! Uses:

- `node:test` (built-in)
- `node:assert` (built-in)
- `fs`, `path`, `child_process` (built-in)
