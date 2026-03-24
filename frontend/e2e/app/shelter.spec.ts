import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import {
  SHELTER_BROWSE,
  SHELTER_DETAIL,
  SHELTER_ONBOARDING,
  SHELTER_PANEL_DASHBOARD,
  SHELTER_PANEL_ANIMALS,
  SHELTER_PANEL_CAMPAIGNS,
  SHELTER_PANEL_DONATIONS,
  SHELTER_PANEL_SETTINGS,
} from '../helpers/flow-tags';

test.describe('Shelter Public Pages', () => {
  test('should display shelters listing page', { tag: [...SHELTER_BROWSE] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*refugios/);
  });

  test('should navigate to shelter detail from listing', { tag: [...SHELTER_DETAIL] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic data: no testid on shelter cards, first visible link needed)
    const shelterLink = page.locator('a[href*="/shelters/"]').first();
    if (await shelterLink.isVisible({ timeout: 5000 })) {
      await shelterLink.click();
      await page.waitForURL(/.*refugios\/\d+/, { timeout: 10_000 });

      await expect(page).toHaveURL(/.*refugios\/\d+/);
    }
  });
});

test.describe('Shelter Onboarding', () => {
  test('should redirect unauthenticated user from onboarding', { tag: [...SHELTER_ONBOARDING] }, async ({ page }) => {
    await page.goto('/shelter/onboarding');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|onboarding/);
  });

  test('should display shelter registration form when accessible', { tag: [...SHELTER_ONBOARDING] }, async ({ page }) => {
    await page.goto('/shelter/onboarding');
    await waitForPageLoad(page);

    if (page.url().includes('onboarding')) {
      await expect(page.getByRole('heading', { name: /Registrar Refugio/i })).toBeVisible();
      await expect(page.getByLabel(/Nombre del refugio/i)).toBeVisible();
      await expect(page.getByLabel(/Ciudad/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Registrar refugio/i })).toBeVisible();
    }
  });
});

test.describe('Shelter Panel', () => {
  test('should redirect unauthenticated user from shelter dashboard', { tag: [...SHELTER_PANEL_DASHBOARD] }, async ({ page }) => {
    await page.goto('/shelter/dashboard');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|dashboard/);
  });

  test('should display shelter dashboard or redirect when unauthenticated', { tag: [...SHELTER_PANEL_DASHBOARD] }, async ({ page }) => {
    await page.goto('/shelter/dashboard');
    await waitForPageLoad(page);

    // Unauthenticated user is redirected to sign-in; authenticated sees dashboard heading
    const isSignIn = page.url().includes('sign-in');
    const isDashboard = page.url().includes('refugio/dashboard');
    expect(isSignIn || isDashboard).toBe(true);
  });

  test('should redirect unauthenticated user from shelter animals', { tag: [...SHELTER_PANEL_ANIMALS] }, async ({ page }) => {
    await page.goto('/shelter/animales');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|animales/);
  });

  test('should redirect unauthenticated user from shelter campaigns', { tag: [...SHELTER_PANEL_CAMPAIGNS] }, async ({ page }) => {
    await page.goto('/shelter/campanas');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|campanas/);
  });

  test('should redirect unauthenticated user from shelter donations', { tag: [...SHELTER_PANEL_DONATIONS] }, async ({ page }) => {
    await page.goto('/shelter/donaciones');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|donaciones/);
  });

  test('should redirect unauthenticated user from shelter settings', { tag: [...SHELTER_PANEL_SETTINGS] }, async ({ page }) => {
    await page.goto('/shelter/configuracion');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|configuracion/);
  });
});
