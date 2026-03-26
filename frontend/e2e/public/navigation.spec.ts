import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAs } from '../fixtures';
import {
  HOME_LOADS,
  HOME_TO_ANIMALS,
  HOME_TO_SHELTERS,
  HOME_TO_CAMPAIGNS,
  NAVIGATION_BETWEEN_PAGES,
  NAVIGATION_HEADER,
  NAVIGATION_FOOTER,
  LOCALE_SWITCH,
  NOTIFICATION_BELL,
} from '../helpers/flow-tags';

test.describe('Navigation', () => {
  test('should render home page with hero', { tag: [...HOME_LOADS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/(es\/?)?$/);
    await expect(page.getByRole('heading', { name: /Cada huella cuenta/i })).toBeVisible();
  });

  test('should navigate from home to animales', { tag: [...HOME_TO_ANIMALS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('link', { name: 'Ver Animales' }).click();
    await page.waitForURL(/.*animals/, { timeout: 10_000 });

    await expect(page).toHaveURL(/.*animals/);
    await expect(page.getByRole('heading', { name: /Animales en adopción/i })).toBeVisible();
  });

  test('should navigate from home to refugios', { tag: [...HOME_TO_SHELTERS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // The shelters section heading is "Refugios destacados"; the "Ver todos" link next to it goes to /refugios
    const shelterSection = page.locator('section', { has: page.getByText('Refugios destacados') });
    await expect(shelterSection).toBeVisible({ timeout: 15_000 });
    await shelterSection.getByRole('link', { name: /Ver todos/i }).click();
    await page.waitForURL(/.*shelters/, { timeout: 10_000 });

    await expect(page).toHaveURL(/.*shelters/);
  });

  test('should navigate from home to campanas', { tag: [...HOME_TO_CAMPAIGNS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.getByRole('link', { name: 'Donar' }).click();
    await page.waitForURL(/.*campaigns/, { timeout: 10_000 });

    await expect(page).toHaveURL(/.*campaigns/);
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
    await expect(page).toHaveURL(/\/(es\/?)?$/);

    await page.goto('/animals', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*animals/);

    await page.goto('/shelters', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*shelters/);

    await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*campaigns/);

    await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*sign-in/);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/(es\/?)?$/);
  });

  test('should switch locale from Spanish to English', { tag: [...LOCALE_SWITCH] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Verify the page loads in Spanish by default
    await expect(page.getByRole('heading', { name: /Cada huella cuenta/i })).toBeVisible();

    // The LocaleSwitcher is a radiogroup with ES/EN buttons
    const localeSwitcher = page.getByRole('radiogroup', { name: /Select language/i });
    await expect(localeSwitcher).toBeVisible();

    // Click the EN radio button to switch to English
    const enButton = localeSwitcher.getByRole('radio', { name: 'EN' });
    await enButton.click();

    // Wait for navigation to complete (locale change triggers route replace)
    await page.waitForURL(/\/en\/?/, { timeout: 10_000 });

    // Verify content changed to English
    await expect(page.getByRole('heading', { name: /Every paw print matters/i })).toBeVisible();
  });
});

test.describe('Notification Bell (authenticated)', () => {
  test.describe.configure({ mode: 'serial' });

  test('should open notification dropdown when bell is clicked', { tag: [...NOTIFICATION_BELL] }, async ({ page }) => {
    await loginAs(page, 'adopter');

    await page.goto('/');
    await waitForPageLoad(page);

    // Click the notification bell button in the header
    const bellButton = page.getByRole('button', { name: /Notificaciones/i });
    await expect(bellButton).toBeVisible();
    await bellButton.click();

    // Verify the notification dropdown opens
    const dropdown = page.getByTestId('notification-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Verify dropdown has the notifications title header
    await expect(dropdown.getByText('Notificaciones', { exact: true })).toBeVisible();
  });
});
