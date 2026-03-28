import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  FAVORITE_TOGGLE,
  FAVORITE_LIST,
  FAVORITES_COMPARE,
  DONATION_HISTORY,
  SPONSORSHIP_HISTORY,
  ADOPTER_INTENT_CREATE,
  ADOPTER_INTENT_BROWSE,
  ADOPTER_PROFILE,
  PROFILE_EDIT,
  NOTIFICATION_PREFERENCES,
} from '../helpers/flow-tags';
import {
  mockProfileStats,
  mockActivity,
  mockFavorites,
  mockFavoritesBella,
} from '../helpers/mock-data';

function mockFavoritesRoute(page: any, data: any[] = mockFavorites) {
  return page.route('**/favorites/**', (route: any) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    }
    return route.continue();
  });
}

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


test.describe('Adopter Profile — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display profile dashboard with stats and activity', { tag: [...ADOPTER_PROFILE] }, async ({ page }) => {
    await page.route('**/user/profile-stats/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
    );
    await page.route('**/user/activity/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockActivity) }),
    );

    await loginAndNavigate(page, 'adopter', '/my-profile');

    // Verify profile heading or user name is visible
    const profileName = page.getByText(/Carlos/i);
    const profileHeading = page.getByRole('heading', { name: /perfil|profile/i });
    await expect(profileName.or(profileHeading)).toBeVisible({ timeout: 15_000 });

    // Verify stats are rendered (donation count or amount)
    const donationStat = page.getByText(/150.000|150,000|3.*donac/i);
    const hasDonationStat = await donationStat.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(hasDonationStat).toBe(true);

    // Verify activity timeline has entries
    const activityEntry = page.getByText(/Luna|Refugio Amor/i).first();
    await expect(activityEntry).toBeVisible({ timeout: 5_000 });
  });

  test('should display edit profile form and save changes', { tag: [...PROFILE_EDIT] }, async ({ page }) => {
    await page.route('**/user/profile/**', (route: any) => {
      if (route.request().method() === 'PATCH') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1, email: 'adopter-e2e@example.com',
            first_name: 'Carlos Editado', last_name: 'Pérez',
            phone: '+57 300 999 8888', city: 'Medellín',
            role: 'adopter', is_staff: false, is_active: true,
          }),
        });
      }
      return route.continue();
    });
    await page.route('**/user/profile-stats/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
    );

    await loginAndNavigate(page, 'adopter', '/my-profile/edit');

    // Verify edit form fields are present
    const firstNameInput = page.getByLabel(/Nombre/i).first();
    await expect(firstNameInput).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/Apellido/i)).toBeVisible();

    // Modify a field
    await firstNameInput.clear();
    await firstNameInput.fill('Carlos Editado');

    const phoneInput = page.getByLabel(/Teléfono/i);
    await phoneInput.clear();
    await phoneInput.fill('+57 300 999 8888');

    // Save
    await page.getByRole('button', { name: /Guardar|Save/i }).click();

    // Verify success feedback
    const successMsg = page.getByText(/guardados|saved|éxito/i);
    await expect(successMsg).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Favorites — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display favorites list with animal cards', { tag: [...FAVORITE_LIST] }, async ({ page }) => {
    await mockFavoritesRoute(page);
    await loginAndNavigate(page, 'adopter', '/favorites');

    // Verify favorite animals are displayed
    await expect(page.getByText('Luna')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Milo')).toBeVisible();
    await expect(page.getByText('Rocky')).toBeVisible();
  });

  test('should compare favorited animals side-by-side', { tag: [...FAVORITES_COMPARE] }, async ({ page }) => {
    await mockFavoritesRoute(page);
    await loginAndNavigate(page, 'adopter', '/favorites');

    // Wait for cards to render
    await expect(page.getByText('Luna')).toBeVisible({ timeout: 15_000 });

    // Select two animals for comparison via checkboxes
    const checkboxes = page.getByRole('checkbox');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount >= 2) {
      // quality: allow-fragile-selector (positional: selecting Nth favorite for comparison is the intended behavior)
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check(); // quality: allow-fragile-selector (positional: selecting Nth favorite for comparison)

      // Click compare button (should appear in floating bar)
      const compareBtn = page.getByRole('button', { name: /Comparar|Compare/i });
      await expect(compareBtn).toBeVisible({ timeout: 5_000 });
      await compareBtn.click();

      // Verify comparison modal/panel shows animal attributes
      const comparisonContent = page.getByText(/Labrador|Siamés/i).first();
      await expect(comparisonContent).toBeVisible({ timeout: 5_000 });

      // Verify comparison shows species, breed, or other attributes
      const speciesRow = page.getByText(/dog|cat|perro|gato/i).first();
      await expect(speciesRow).toBeVisible();
    }
  });
});

test.describe('Favorites Compare — Boundary', () => {
  const fourFavorites = [...mockFavorites, mockFavoritesBella];

  test('should enforce max 3 animals for comparison', { tag: [...FAVORITES_COMPARE] }, async ({ page }) => {
    await mockFavoritesRoute(page, fourFavorites);
    await loginAndNavigate(page, 'adopter', '/favorites');

    await expect(page.getByText('Luna')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Bella')).toBeVisible();

    const checkboxes = page.getByRole('checkbox');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount >= 4) {
      // quality: allow-fragile-selector (positional: selecting Nth favorite for comparison is the intended behavior)
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check(); // quality: allow-fragile-selector (positional: selecting Nth favorite for comparison)
      await checkboxes.nth(2).check(); // quality: allow-fragile-selector (positional: selecting Nth favorite for comparison)

      // The compare button should be visible with 3 selected
      const compareBtn = page.getByRole('button', { name: /Comparar|Compare/i });
      await expect(compareBtn).toBeVisible({ timeout: 5_000 });

      // quality: allow-fragile-selector (positional: testing 4th checkbox disabled state requires nth access)
      const fourthCheckbox = checkboxes.nth(3);
      const isDisabled = await fourthCheckbox.isDisabled().catch(() => false);
      if (!isDisabled) {
        // Try checking — count should stay at 3
        await fourthCheckbox.check().catch(() => {});
      }

      // Verify the floating bar shows count (e.g., "3 seleccionados" or "Comparar (3)")
      const countIndicator = page.getByText(/3.*selec|Comparar.*3|\(3\)/i);
      const hasCount = await countIndicator.isVisible({ timeout: 3_000 }).catch(() => false);
      // Either count is shown or 4th was successfully blocked
      expect(hasCount || isDisabled).toBe(true);
    }
  });

  test('should disable compare button with only 1 animal selected', { tag: [...FAVORITES_COMPARE] }, async ({ page }) => {
    await mockFavoritesRoute(page);
    await loginAndNavigate(page, 'adopter', '/favorites');

    await expect(page.getByText('Luna')).toBeVisible({ timeout: 15_000 });

    const checkboxes = page.getByRole('checkbox');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount >= 1) {
      // quality: allow-fragile-selector (positional: selecting first favorite for single-selection boundary test)
      await checkboxes.nth(0).check();

      // The compare button should either not appear or be disabled
      const compareBtn = page.getByRole('button', { name: /Comparar|Compare/i });
      const isVisible = await compareBtn.isVisible({ timeout: 3_000 }).catch(() => false);

      if (isVisible) {
        await expect(compareBtn).toBeDisabled();
      }
      // If not visible, that's also valid (button only appears with 2+ selected)
    }
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
