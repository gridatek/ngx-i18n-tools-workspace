import { test, expect } from '@playwright/test';

/**
 * E2E tests for ngx-i18n-tools demo app
 * Tests i18n functionality across different locales
 */

test.describe('Demo App - Home Page', () => {
  test('should display home page with correct translations', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page).toHaveTitle(/ngx-i18n-tools Demo/i);

    // Check navigation is visible
    await expect(page.locator('nav')).toBeVisible();

    // Check home link exists
    const homeLink = page.getByRole('link', { name: /home|inicio|accueil|startseite/i });
    await expect(homeLink).toBeVisible();

    // Check profile link exists
    const profileLink = page.getByRole('link', { name: /profile|perfil|profil|benutzerprofil/i });
    await expect(profileLink).toBeVisible();

    // Check welcome message is visible
    const welcomeHeading = page.getByRole('heading', {
      name: /welcome|bienvenido|bienvenue|willkommen/i,
    });
    await expect(welcomeHeading).toBeVisible();

    // Check footer is visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/gridatek/i);
  });

  test('should display greeting with interpolation', async ({ page }) => {
    await page.goto('/');

    // Check that interpolated greeting is visible
    // The greeting should contain "Hello" (or translated version) and "userName"
    const greeting = page.getByText(/hello|hola|bonjour|hallo/i);
    await expect(greeting).toBeVisible();
  });

  test('should display item count with pluralization', async ({ page }) => {
    await page.goto('/');

    // Check that plural message is visible
    // This tests ICU message format for plurals
    const itemCount = page.getByText(/item|elemento|élément|element/i);
    await expect(itemCount).toBeVisible();
  });

  test('should have "Get Started" button', async ({ page }) => {
    await page.goto('/');

    const button = page.getByRole('button', { name: /get started|comenzar|commencer|anfangen/i });
    await expect(button).toBeVisible();
  });
});

test.describe('Demo App - Navigation', () => {
  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/');

    // Click on profile link
    const profileLink = page.getByRole('link', { name: /profile|perfil|profil/i });
    await profileLink.click();

    // Wait for navigation
    await page.waitForURL(/.*profile.*/);

    // Check profile page is loaded
    const profileHeading = page.getByRole('heading', {
      name: /user profile|perfil de usuario|profil utilisateur|benutzerprofil/i,
    });
    await expect(profileHeading).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/profile');

    // Click on home link
    const homeLink = page.getByRole('link', { name: /home|inicio|accueil|startseite/i });
    await homeLink.click();

    // Wait for navigation
    await page.waitForURL(/^http:\/\/localhost:4200\/?$/);

    // Check home page is loaded
    const welcomeHeading = page.getByRole('heading', {
      name: /welcome|bienvenido|bienvenue|willkommen/i,
    });
    await expect(welcomeHeading).toBeVisible();
  });
});

test.describe('Demo App - Profile Page', () => {
  test('should display profile page with form fields', async ({ page }) => {
    await page.goto('/profile');

    // Check profile title
    const profileHeading = page.getByRole('heading', {
      name: /user profile|perfil de usuario|profil utilisateur|benutzerprofil/i,
    });
    await expect(profileHeading).toBeVisible();

    // Check name label exists
    const nameLabel = page.getByText(/name|nombre|nom/i);
    await expect(nameLabel).toBeVisible();

    // Check email label exists
    const emailLabel = page.getByText(/email|correo|e-mail/i);
    await expect(emailLabel).toBeVisible();
  });

  test('should have edit profile button', async ({ page }) => {
    await page.goto('/profile');

    const editButton = page.getByRole('button', {
      name: /edit profile|editar perfil|modifier le profil|profil bearbeiten/i,
    });
    await expect(editButton).toBeVisible();
  });

  test('should have settings button', async ({ page }) => {
    await page.goto('/profile');

    const settingsButton = page.getByRole('button', {
      name: /settings|configuración|paramètres|einstellungen/i,
    });
    await expect(settingsButton).toBeVisible();
  });

  test('should display search placeholder', async ({ page }) => {
    await page.goto('/profile');

    // Look for search input with placeholder
    const searchInput = page.getByPlaceholder(/search|buscar|rechercher|suchen/i);
    await expect(searchInput).toBeVisible();
  });
});

test.describe('Demo App - Locale-Specific Tests', () => {
  test('should display correct locale in HTML lang attribute', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const lang = await html.getAttribute('lang');

    // Check that lang attribute is set (it should match the build locale)
    expect(lang).toBeTruthy();
  });

  test('should maintain translations after page reload', async ({ page }) => {
    await page.goto('/');

    // Get the welcome text before reload
    const welcomeHeading = page.getByRole('heading', {
      name: /welcome|bienvenido|bienvenue|willkommen/i,
    });
    const textBefore = await welcomeHeading.textContent();

    // Reload the page
    await page.reload();

    // Check that the text is still the same
    const textAfter = await welcomeHeading.textContent();
    expect(textAfter).toBe(textBefore);
  });
});

test.describe('Demo App - Accessibility', () => {
  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check that nav has proper structure
    const links = nav.getByRole('link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1 heading
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('profile page should have proper form labels', async ({ page }) => {
    await page.goto('/profile');

    // Check that form has proper labels
    const labels = page.locator('label');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
  });
});
