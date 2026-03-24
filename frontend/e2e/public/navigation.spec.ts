import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import {
  HOME_LOADS,
  HOME_TO_ANIMALS,
  HOME_TO_SHELTERS,
  HOME_TO_CAMPAIGNS,
  NAVIGATION_BETWEEN_PAGES,
  NAVIGATION_HEADER,
  NAVIGATION_FOOTER,
} from '../helpers/flow-tags';

test.describe('Navigation', () => {
  test('should render home page with hero', { tag: [...HOME_LOADS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /Cada huella cuenta/i })).toBeVisible();
  });

  test('should navigate from home to animales', { tag: [...HOME_TO_ANIMALS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('link', { name: 'Ver Animales' }).click();
    await page.waitForURL(/.*animales/, { timeout: 10_000 });

    await expect(page).toHaveURL(/.*animales/);
    await expect(page.getByRole('heading', { name: /Animales en adopción/i })).toBeVisible();
  });

  test('should navigate from home to refugios', { tag: [...HOME_TO_SHELTERS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // The shelters section heading is "Refugios destacados"; the "Ver todos" link next to it goes to /refugios
    const shelterSection = page.locator('section', { has: page.getByText('Refugios destacados') });
    await expect(shelterSection).toBeVisible({ timeout: 15_000 });
    await shelterSection.getByRole('link', { name: /Ver todos/i }).click();
    await page.waitForURL(/.*refugios/, { timeout: 10_000 });

    await expect(page).toHaveURL(/.*refugios/);
  });

  test('should navigate from home to campanas', { tag: [...HOME_TO_CAMPAIGNS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('link', { name: 'Donar' }).click();
    await page.waitForURL(/.*campanas/, { timeout: 10_000 });

    await expect(page).toHaveURL(/.*campanas/);
  });

  test('should have working header navigation', { tag: [...NAVIGATION_HEADER] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const header = page.getByRole('banner');
    await expect(header).toBeVisible();

    const links = header.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should have working footer', { tag: [...NAVIGATION_FOOTER] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should maintain navigation across Tu Huella pages', { tag: [...NAVIGATION_BETWEEN_PAGES] }, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/');

    await page.goto('/animals', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*animales/);

    await page.goto('/shelters', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*refugios/);

    await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*campanas/);

    await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*sign-in/);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/');
  });
});
