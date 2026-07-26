import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import { MANUAL_BROWSE, MANUAL_SEARCH, MANUAL_ROLE_FILTER } from '../helpers/flow-tags';

test.describe('Manual — Unauthenticated', () => {
  test('should redirect unauthenticated user away from manual', { tag: [...MANUAL_BROWSE] }, async ({ page }) => {
    await page.goto('/manual');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Manual — Web Manager', () => {
  test('should load the manual page and display the web manager section', { tag: [...MANUAL_BROWSE] }, async ({ page }) => {
    await loginAndNavigate(page, 'web_manager', '/manual');

    await expect(page.getByRole('heading', { name: /manual/i, level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /Web Manager/i })).toBeVisible({ timeout: 10_000 });
  });

  test('should display the "Cómo empezar" highlighted section', { tag: [...MANUAL_BROWSE] }, async ({ page }) => {
    await loginAndNavigate(page, 'web_manager', '/manual');

    await expect(page.getByRole('heading', { name: /cómo empezar/i })).toBeVisible({ timeout: 15_000 });
  });

  test('should return results when searching for new process keywords', { tag: [...MANUAL_SEARCH] }, async ({ page }) => {
    await loginAndNavigate(page, 'web_manager', '/manual');

    const searchbox = page.getByRole('searchbox');
    await expect(searchbox).toBeVisible({ timeout: 15_000 });

    await searchbox.fill('voluntariado');

    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5_000 });
  });

  test('should display search input on the manual page', { tag: [...MANUAL_SEARCH] }, async ({ page }) => {
    await loginAndNavigate(page, 'web_manager', '/manual');

    await expect(page.getByRole('searchbox')).toBeVisible({ timeout: 15_000 });
  });

  test('should show search results when typing a query', { tag: [...MANUAL_SEARCH] }, async ({ page }) => {
    await loginAndNavigate(page, 'web_manager', '/manual');

    const searchbox = page.getByRole('searchbox');
    await expect(searchbox).toBeVisible({ timeout: 15_000 });

    await searchbox.fill('adopción');

    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5_000 });
  });

  test('should show no-results message for an unmatched query', { tag: [...MANUAL_SEARCH] }, async ({ page }) => {
    await loginAndNavigate(page, 'web_manager', '/manual');

    const searchbox = page.getByRole('searchbox');
    await expect(searchbox).toBeVisible({ timeout: 15_000 });

    await searchbox.fill('zxqvbnmplkj');

    await expect(page.getByText(/Sin resultados/i)).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Manual — Role Filtering', () => {
  test('should allow adopter to access the manual (no redirect)', { tag: [...MANUAL_ROLE_FILTER] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/manual');

    await expect(page).not.toHaveURL(/sign-in/);
    await expect(page.getByRole('heading', { name: /cómo empezar/i })).toBeVisible({ timeout: 15_000 });
  });

  test('should show cross/public sections to adopter', { tag: [...MANUAL_ROLE_FILTER] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/manual');

    await expect(page.getByRole('heading', { name: /cómo empezar/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('searchbox')).toBeVisible({ timeout: 10_000 });
  });

  test('should hide web_manager-only section from adopter', { tag: [...MANUAL_ROLE_FILTER] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/manual');

    await page.waitForSelector('[role="navigation"], nav, aside', { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /Rol: Web Manager/i })).not.toBeVisible();
  });

  test('should show web_manager section to web_manager role', { tag: [...MANUAL_ROLE_FILTER] }, async ({ page }) => {
    await loginAndNavigate(page, 'web_manager', '/manual');

    await expect(page.getByRole('heading', { name: /Rol: Web Manager/i })).toBeVisible({ timeout: 15_000 });
  });

  test('should show adopter search results only from visible sections', { tag: [...MANUAL_ROLE_FILTER] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/manual');

    const searchbox = page.getByRole('searchbox');
    await expect(searchbox).toBeVisible({ timeout: 15_000 });

    await searchbox.fill('adoptar');

    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5_000 });
  });
});
