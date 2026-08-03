import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { HOME_LOADS } from '../helpers/flow-tags';

test.describe('Home — Loads', () => {
  test('renders the hero with badge, headline and primary CTA', { tag: [...HOME_LOADS, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (home is the app entry point: there is no prior page to navigate from, and the hero is render-only chrome — the CTA's href is asserted rather than followed, deliberately, so this stays a render check and the click path stays owned by navigation.spec.ts)
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
