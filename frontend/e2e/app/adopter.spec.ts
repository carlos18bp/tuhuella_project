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
