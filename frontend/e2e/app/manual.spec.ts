import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import { MANUAL_BROWSE, MANUAL_SEARCH } from '../helpers/flow-tags';

test.describe('Manual — Unauthenticated', () => {
  test('should redirect unauthenticated user away from manual', { tag: [...MANUAL_BROWSE] }, async ({ page }) => {
    await page.goto('/manual');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|manual/);
  });
});

test.describe('Manual — Web Manager', () => {
  test('should load the manual page and display the web manager section', { tag: [...MANUAL_BROWSE] }, async ({ page }) => {
    await loginAndNavigate(page, 'web_manager', '/manual');

    await expect(page.getByRole('heading', { name: /manual/i, level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Web Manager/i)).toBeVisible({ timeout: 10_000 });
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
