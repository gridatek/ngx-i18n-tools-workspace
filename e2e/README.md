# E2E Tests for ngx-i18n-tools Demo App

This directory contains end-to-end tests using Playwright to verify that the demo application works correctly with translations across multiple locales.

## Setup

### Install Playwright Browsers

```bash
npx playwright install
```

Or install just Chromium (used by default):

```bash
npx playwright install chromium
```

## Running Tests

### Run all tests (headless)

```bash
npm run test:e2e
```

### Run tests with UI (interactive mode)

```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e:headed
```

### View test report

```bash
npm run test:e2e:report
```

## Test Structure

The tests are organized into several suites:

### 1. **Home Page Tests**

- Verifies navigation elements are visible
- Checks translations are displayed correctly
- Tests interpolation (greeting with userName)
- Tests pluralization (item counts)

### 2. **Navigation Tests**

- Tests navigation between pages
- Verifies routing works correctly

### 3. **Profile Page Tests**

- Checks form fields and labels are displayed
- Verifies buttons are visible
- Tests search functionality

### 4. **Locale-Specific Tests**

- Verifies HTML lang attribute is set
- Tests translation persistence after reload

### 5. **Accessibility Tests**

- Checks proper navigation structure
- Verifies heading hierarchy
- Tests form labels

## Test Configuration

Tests run in 4 different locale configurations:

- `chromium-en` - English (en-US)
- `chromium-es` - Spanish (es-ES)
- `chromium-fr` - French (fr-FR)
- `chromium-de` - German (de-DE)

Each test suite runs against all locales to ensure translations work correctly.

## Configuration File

The Playwright configuration is in `playwright.config.ts` at the project root.

Key settings:

- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:4200`
- **Web server**: Automatically starts `npm run serve:demo`
- **Reporter**: HTML report (generated in `playwright-report/`)

## Writing New Tests

To add new tests:

1. Create a new `.spec.ts` file in the `e2e` directory
2. Import test utilities: `import { test, expect } from '@playwright/test';`
3. Write tests using locator patterns that work across all locales
4. Use regex patterns for text matching to support multiple languages

Example:

```typescript
test('should display button in all locales', async ({ page }) => {
  await page.goto('/');

  // Use regex to match text in any locale
  const button = page.getByRole('button', {
    name: /get started|comenzar|commencer|anfangen/i,
  });

  await expect(button).toBeVisible();
});
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e
```

## Troubleshooting

### Tests fail with "page.goto: Timeout"

Make sure the demo app is running:

```bash
npm run serve:demo
```

Or let Playwright start it automatically (default configuration).

### Browser not found

Install Playwright browsers:

```bash
npx playwright install
```

### Tests fail in CI

Ensure you install system dependencies:

```bash
npx playwright install --with-deps
```

## Coverage

The current test suite covers:

- ✅ All navigation flows
- ✅ All major UI components
- ✅ Translation display in 4 locales
- ✅ Interpolation functionality
- ✅ Pluralization functionality
- ✅ Basic accessibility checks

## Future Enhancements

Potential additions:

- Visual regression testing
- Performance testing
- Mobile/tablet viewport testing
- More comprehensive accessibility audits
- API mocking for translation loading
