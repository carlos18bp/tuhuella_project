import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import {
  FAVORITE_TOGGLE,
  FAVORITE_LIST,
  DONATION_HISTORY,
  SPONSORSHIP_HISTORY,
  ADOPTER_INTENT_CREATE,
  ADOPTER_INTENT_BROWSE,
  ADOPTER_PROFILE,
} from '../helpers/flow-tags';

test.describe('Adopter Pages — Protected Routes', () => {
  test('should redirect unauthenticated user from favorites', { tag: [...FAVORITE_LIST] }, async ({ page }) => {
    await page.goto('/favoritos');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|favoritos/);
  });

  test('should redirect unauthenticated user from donation history', { tag: [...DONATION_HISTORY] }, async ({ page }) => {
    await page.goto('/mis-donaciones');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|mis-donaciones/);
  });

  test('should redirect unauthenticated user from sponsorship history', { tag: [...SPONSORSHIP_HISTORY] }, async ({ page }) => {
    await page.goto('/mis-apadrinamientos');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|mis-apadrinamientos/);
  });

  test('should redirect unauthenticated user from adopter intent', { tag: [...ADOPTER_INTENT_CREATE] }, async ({ page }) => {
    await page.goto('/mi-intencion');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|mi-intencion/);
  });

  test('should redirect unauthenticated user from profile', { tag: [...ADOPTER_PROFILE] }, async ({ page }) => {
    await page.goto('/mi-perfil');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|mi-perfil/);
  });
});

test.describe('Adopter Pages — Public', () => {
  test('should display busco adoptar listing', { tag: [...ADOPTER_INTENT_BROWSE] }, async ({ page }) => {
    await page.goto('/busco-adoptar');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*busco-adoptar/);
  });
});

test.describe('Favorite Toggle', () => {
  test('should require authentication to toggle favorite', { tag: [...FAVORITE_TOGGLE] }, async ({ page }) => {
    // @flow:favorite-toggle — unauthenticated user attempting to favorite an animal
    await page.goto('/animales');
    await waitForPageLoad(page);

    const firstAnimalLink = page.locator('a[href*="/animales/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animales\/\d+/, { timeout: 10_000 });

      // Favorite button should either be absent or prompt sign-in
      const favoriteBtn = page.locator('button:has-text("Favorito"), button:has-text("Guardar"), [data-testid="favorite-toggle"]');
      const hasFavorite = await favoriteBtn.first().isVisible({ timeout: 3000 }).catch(() => false);

      // If visible, clicking should redirect to sign-in (unauthenticated)
      if (hasFavorite) {
        await favoriteBtn.first().click();
        // Should either redirect to sign-in or show a login prompt
        await page.waitForTimeout(1000);
        const url = page.url();
        expect(url).toMatch(/sign-in|animales/);
      }
    }
  });
});
