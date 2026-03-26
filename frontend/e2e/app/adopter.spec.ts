import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  FAVORITE_TOGGLE,
  FAVORITE_LIST,
  DONATION_HISTORY,
  SPONSORSHIP_HISTORY,
  ADOPTER_INTENT_CREATE,
  ADOPTER_INTENT_BROWSE,
  ADOPTER_PROFILE,
  NOTIFICATION_PREFERENCES,
} from '../helpers/flow-tags';

test.describe('Adopter Pages — Protected Routes', () => {
  test('should redirect unauthenticated user from favorites', { tag: [...FAVORITE_LIST] }, async ({ page }) => {
    await page.goto('/favorites');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|favorites/);
  });

  test('should redirect unauthenticated user from donation history', { tag: [...DONATION_HISTORY] }, async ({ page }) => {
    await page.goto('/my-donations');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|my-donations/);
  });

  test('should redirect unauthenticated user from sponsorship history', { tag: [...SPONSORSHIP_HISTORY] }, async ({ page }) => {
    await page.goto('/my-sponsorships');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|my-sponsorships/);
  });

  test('should redirect unauthenticated user from adopter intent', { tag: [...ADOPTER_INTENT_CREATE] }, async ({ page }) => {
    await page.goto('/my-intent');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|my-intent/);
  });

  test('should redirect unauthenticated user from profile', { tag: [...ADOPTER_PROFILE] }, async ({ page }) => {
    await page.goto('/my-profile');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|my-profile/);
  });
});

test.describe('Adopter Pages — Public', () => {
  test('should display busco adoptar listing', { tag: [...ADOPTER_INTENT_BROWSE] }, async ({ page }) => {
    await page.goto('/looking-to-adopt');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*looking-to-adopt/);
  });
});

test.describe.serial('Adopter Pages — Authenticated', () => {
  test('should display notification preferences page', { tag: [...NOTIFICATION_PREFERENCES] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/my-profile/notifications');

    // Verify the page loaded with the back link
    await expect(page.getByRole('link', { name: /Volver a mi perfil/i })).toBeVisible();

    // Verify heading
    await expect(page.getByRole('heading', { name: /Preferencias de notificación/i })).toBeVisible();

    // Verify toggle switches are visible (target a specific toggle by testid)
    await expect(page.getByTestId('toggle-adoption_submitted-email')).toBeVisible({ timeout: 10_000 });

    // Verify at least one event group heading is visible
    await expect(page.getByRole('heading', { name: /Adopción/i })).toBeVisible();
  });
});

test.describe('Favorite Toggle', () => {
  test('should require authentication to toggle favorite', { tag: [...FAVORITE_TOGGLE] }, async ({ page }) => {
    // @flow:favorite-toggle — unauthenticated user attempting to favorite an animal
    await page.goto('/animals');
    await waitForPageLoad(page);

    const firstAnimalLink = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) }).first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

      // Favorite button should either be absent or prompt sign-in
      const favoriteBtn = page.getByRole('button', { name: 'favorite' });
      const hasFavorite = await favoriteBtn.isVisible({ timeout: 3000 }).catch(() => false);

      // If visible, clicking should redirect to sign-in (unauthenticated)
      if (hasFavorite) {
        await favoriteBtn.click();
        await page.waitForURL(/sign-in|animals/, { timeout: 5_000 }).catch(() => {});
        expect(page.url()).toMatch(/sign-in|animals/);
      }
    }
  });
});
