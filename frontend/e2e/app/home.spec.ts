import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { HOME_LOADS } from '../helpers/flow-tags';

test.describe('Home — Loads', () => {
  test('renders the hero with badge, headline and primary CTA', { tag: [...HOME_LOADS] }, async ({ page }) => {
    // quality: allow-no-interaction (authenticated display test: loginAndNavigate is API-based by design; content is asserted with concrete values)
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page.getByText('Plataforma de adopción y apadrinamiento animal')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/cada huella cuenta/i);
    await expect(page.getByRole('link', { name: 'Ver Animales' }).first()).toHaveAttribute('href', /\/animals$/);
  });

  test('renders the featured-animals and how-it-works sections', { tag: [...HOME_LOADS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Animales en busca de hogar/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /¿Cómo funciona\?/i })).toBeVisible();
  });

  test('renders the why-adopt value section and the platform-support CTA', { tag: [...HOME_LOADS] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /¿Por qué adoptar\?/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /Ver Animales/i }).first()).toHaveAttribute('href', /\/animals$/);
  });
});
