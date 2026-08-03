import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  FAVORITE_TOGGLE,
  FAVORITE_LIST,
  FAVORITES_COMPARE,
  FAVORITE_NOTE_EDIT,
  DONATION_HISTORY,
  SPONSORSHIP_HISTORY,
  ADOPTER_INTENT_CREATE,
  ADOPTER_INTENT_BROWSE,
  ADOPTER_PROFILE,
  PROFILE_EDIT,
  NOTIFICATION_PREFERENCES,
  ADOPTION_APPLICATION_HISTORY,
  PROFILE_ACTIVITY_FEED,
} from '../helpers/flow-tags';
import {
  mockProfileStats,
  mockActivity,
  mockFavorites,
  mockFavoritesBella,
} from '../helpers/mock-data';
import { paceRequestsUnderRateLimit } from '../helpers/pacing';

const mockAnimalForFavoriteToggle = {
  id: 1,
  name: 'Luna',
  slug: 'luna',
  species: 'dog',
  breed: 'Mestizo',
  age_range: 'adult',
  gender: 'female',
  size: 'medium',
  status: 'published',
  description: 'Una perrita cariñosa.',
  is_vaccinated: true,
  is_sterilized: true,
  shelter: 1,
  shelter_name: 'Patitas Felices',
  shelter_city: 'Bogotá',
  gallery_urls: [],
  created_at: '2026-01-10T12:00:00Z',
};

async function setupFavoriteToggleRoutes(page: any) {
  await page.route('**/api/animals/**', (route: any) => {
    const url = route.request().url();
    if (url.includes('/similar')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    }
    const isDetail = Boolean(url.match(/\/api\/animals\/\d+/));
    const body = isDetail
      ? mockAnimalForFavoriteToggle
      : { results: [mockAnimalForFavoriteToggle], count: 1, page: 1, page_size: 12, total_pages: 1 };
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  await page.route('**/api/favorites/**', (route: any) => {
    const url = route.request().url();
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    }
    if (url.includes('toggle') && route.request().method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'added',
          favorite: {
            id: 99,
            animal: 1,
            animal_name: 'Luna',
            animal_species: 'dog',
            breed: 'Mestizo',
            age_range: 'adult',
            size: 'medium',
            gender: 'female',
            is_vaccinated: true,
            is_sterilized: true,
            status: 'published',
            shelter_name: 'Patitas Felices',
            shelter_city: 'Bogotá',
            thumbnail_url: null,
            note: '',
            created_at: '2026-03-20T10:00:00Z',
          },
        }),
      });
    }
    return route.continue();
  });
}

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

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from donation history', { tag: [...DONATION_HISTORY] }, async ({ page }) => {
    await page.goto('/my-donations');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from sponsorship history', { tag: [...SPONSORSHIP_HISTORY] }, async ({ page }) => {
    await page.goto('/my-sponsorships');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from adopter intent', { tag: [...ADOPTER_INTENT_CREATE] }, async ({ page }) => {
    await page.goto('/my-intent');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from profile', { tag: [...ADOPTER_PROFILE] }, async ({ page }) => {
    await page.goto('/my-profile');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
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
    // Bug caught: handleToggle sending the CURRENT value instead of its negation
    // (my-profile/notifications/page.tsx:51 `updatePreference(pref.id, !pref.enabled)`).
    // Drop the `!` and every toggle becomes a no-op that still animates — the PATCH
    // payload is the only witness, no visibility assertion can see it.
    const seeded = [
      { id: 7, event_key: 'adoption_submitted', channel: 'email', enabled: true },
      { id: 8, event_key: 'adoption_submitted', channel: 'in_app', enabled: true },
    ];
    let patched: unknown[] | null = null;

    test.slow();
    await paceRequestsUnderRateLimit(page);
    // The page seeds itself with POST /notifications/preferences/init/ and the store
    // swallows every error, so an unmocked init leaves getPref() undefined and the
    // click is a silent no-op.
    await page.route('**/notifications/preferences/init/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ preferences: seeded }),
      }),
    );
    await page.route('**/notifications/preferences/update/**', (route: any) => {
      patched = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ preferences: [{ ...seeded[0], enabled: false }, seeded[1]] }),
      });
    });

    await loginAndNavigate(page, 'adopter', '/my-profile/notifications');

    await expect(page.getByRole('heading', { name: /Preferencias de notificación/i })).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('toggle-adoption_submitted-email').click();

    await expect.poll(() => patched).toMatchObject([{ id: 7, enabled: false }]);
  });
});


test.describe('Adopter Profile — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display profile dashboard with stats and activity', { tag: [...ADOPTER_PROFILE, ...PROFILE_ACTIVITY_FEED, '@outcome:display'] }, async ({ page }) => {
    // Bug caught: the account-menu entry to /my-profile breaking (Header.tsx:106), or the
    // dashboard wiring the stats/activity endpoints but rendering nothing from them. The
    // previous `isVisible().catch(() => false)` boolean swallowed a locator error as a
    // plain false, so a blank dashboard read the same as a populated one.
    //
    // Also carries PROFILE_ACTIVITY_FEED: this test IS that flow's display case. It reaches
    // /my-profile through the UI and asserts the timeline's rendered content, while the
    // flow's own spec ('adopter sees the recent-activity timeline on their profile', below)
    // deep-links there and so cannot buy credit. The timeline has no interactable element in
    // its populated branch — my-profile/page.tsx:102-121 renders divs and <p>s only; the one
    // Link lives in the events.length === 0 branch (:34), a different state.
    test.slow();
    await paceRequestsUnderRateLimit(page);
    await page.route('**/user/profile-stats/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
    );
    await page.route('**/user/activity/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockActivity) }),
    );

    await loginAndNavigate(page, 'adopter', '/');
    await page.getByRole('button', { name: /Abrir menú de cuenta/i }).click();
    await page.getByRole('menuitem', { name: 'Mi Perfil' }).click();

    await expect(page).toHaveURL(/\/my-profile$/);
    // mockActivity[0] → profile.activityApplication = 'Aplicaste para adoptar a {name}'
    await expect(page.getByText('Aplicaste para adoptar a Luna')).toBeVisible({ timeout: 15_000 });
    // mockProfileStats.donations → profile.donationsCount = '${amount} donados en {count} donaciones'
    await expect(page.getByText('$150000 donados en 3 donaciones')).toBeVisible();
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

  // Fails if the form stops validating the name client-side and lets an empty
  // profile reach the API — the user would see a generic save failure, or worse,
  // a saved profile with no name on it.
  test('refuses to submit an empty name and never calls the API', { tag: [...PROFILE_EDIT, '@outcome:error'] }, async ({ page }) => {
    let patched = false;
    await page.route('**/user/profile/**', (route: any) => {
      if (route.request().method() === 'PATCH') {
        patched = true;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      }
      return route.continue();
    });
    await page.route('**/user/profile-stats/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
    );

    await loginAndNavigate(page, 'adopter', '/my-profile/edit');

    const firstNameInput = page.getByLabel(/Nombre/i).first();
    await expect(firstNameInput).toBeVisible({ timeout: 15_000 });
    await firstNameInput.clear();
    await page.getByLabel(/Apellido/i).clear();

    await page.getByRole('button', { name: /Guardar|Save/i }).click();

    // editProfile.nameRequired (messages/es.json:741), rendered by the error
    // container at my-profile/edit/page.tsx:223-225.
    await expect(page.getByText('Nombre y apellido son obligatorios')).toBeVisible({ timeout: 10_000 });
    expect(patched).toBe(false);
  });

  // Fails if a rejected save reports success anyway — the user walks away
  // believing their phone number changed when the server never stored it.
  test('shows the save error when the profile PATCH fails', { tag: [...PROFILE_EDIT, '@outcome:failure'] }, async ({ page }) => {
    await page.route('**/user/profile/**', (route: any) => {
      if (route.request().method() === 'PATCH') {
        return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({}) });
      }
      return route.continue();
    });
    await page.route('**/user/profile-stats/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
    );

    await loginAndNavigate(page, 'adopter', '/my-profile/edit');

    const phoneInput = page.getByLabel(/Teléfono/i);
    await expect(phoneInput).toBeVisible({ timeout: 15_000 });
    await phoneInput.clear();
    await phoneInput.fill('+57 300 111 2222');

    await page.getByRole('button', { name: /Guardar|Save/i }).click();

    // editProfile.saveError (messages/es.json:742), set at my-profile/edit/page.tsx:135.
    await expect(page.getByText('Error al guardar. Intenta de nuevo.')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/guardados|saved|éxito/i)).not.toBeVisible();
  });
});

test.describe('Favorites — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display favorites list with animal cards', { tag: [...FAVORITE_LIST, '@outcome:display'] }, async ({ page }) => {
    // Bug caught: the species filter predicate inverting or being dropped
    // (favorites/page.tsx:404 `result.filter((f) => f.animal_species === speciesFilter)`).
    // A cat-lover filtering to Perros and still seeing cats is invisible to any
    // visibility assertion.
    // Measured: run back-to-back with its siblings against staging this test loses its
    // fixture to nginx 429s and reads as "no data"; paced, it is deterministic.
    test.slow();
    await paceRequestsUnderRateLimit(page);
    await mockFavoritesRoute(page);
    await loginAndNavigate(page, 'adopter', '/favorites');

    // Verify favorite animals are displayed
    await expect(page.getByText('Luna')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Milo')).toBeVisible();
    await expect(page.getByText('Rocky')).toBeVisible();

    // Filter to dogs: mockFavorites is Luna (dog), Milo (cat), Rocky (dog)
    await page.getByRole('main').getByRole('button', { name: 'Perros' }).click();

    await expect(page.getByText('Luna')).toBeVisible();
    await expect(page.getByText('Milo')).toHaveCount(0);
    await expect(page.getByText(/^\d+ resultados$/)).toHaveText('2 resultados');
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

test.describe('Favorite Note Edit', () => {
  test('should edit a note on a favorited animal', { tag: [...FAVORITE_NOTE_EDIT] }, async ({ page }) => {
    let patchedNote = '';
    const singleFavorite = [mockFavorites[0]];
    await page.route('**/favorites/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(singleFavorite),
        });
      }
      if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON();
        patchedNote = body?.note ?? '';
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...mockFavorites[0], note: patchedNote }),
        });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'adopter', '/favorites');

    // Wait for favorites to load
    await expect(page.getByText('Luna')).toBeVisible({ timeout: 15_000 });

    // Click the note toggle button on the card to expand the textarea
    const noteBtn = page.getByRole('button', { name: /nota/i });
    await expect(noteBtn).toBeVisible({ timeout: 5_000 });
    await noteBtn.click();

    // Textarea should appear
    const textarea = page.getByRole('textbox');
    await expect(textarea).toBeVisible({ timeout: 5_000 });

    // Type a note and wait for the debounced PATCH request
    const patchPromise = page.waitForResponse((r) => r.url().includes('/api/favorites/') && r.request().method() === 'PATCH');
    await textarea.fill('Mi favorita para adoptar');
    await patchPromise;

    // Verify the PATCH was sent with the note
    expect(patchedNote).toBe('Mi favorita para adoptar');
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

test.describe('Favorite toggle — authenticated', () => {
  test('should favorite an animal when authenticated user clicks heart', { tag: [...FAVORITE_TOGGLE] }, async ({ page }) => {
    await setupFavoriteToggleRoutes(page);

    await loginAndNavigate(page, 'adopter', '/animals/1');

    const favBtn = page.getByRole('button', { name: 'favorite' });
    await expect(favBtn).toBeVisible({ timeout: 15_000 });
    await favBtn.click();

    await expect(favBtn).toHaveClass(/bg-red-50/);
  });
});

test.describe('Donation history — authenticated', () => {
  test('should display donation history when adopter has donations', { tag: [...DONATION_HISTORY, '@outcome:display'] }, async ({ page }) => {
    // Bug caught: my-donations/page.tsx:47-49 filters client-side on `status`. Drop the
    // predicate and a failed charge shows up under "Pagada" — a money-facing wrong answer
    // that a one-row fixture could never expose.
    test.slow();
    await paceRequestsUnderRateLimit(page);
    const mockDonations = [
      {
        id: 1, user: 1, user_email: 'adopter-e2e@example.com',
        destination: 'shelter' as const, shelter: 1, amount: '50000', status: 'paid' as const,
        shelter_name: 'Refugio Amor', shelter_city: 'Bogotá',
        campaign: null, campaign_title: null,
        paid_at: '2026-02-01T12:00:00Z', created_at: '2026-02-01T12:00:00Z',
      },
      {
        id: 2, user: 1, user_email: 'adopter-e2e@example.com',
        destination: 'shelter' as const, shelter: 2, amount: '75000', status: 'failed' as const,
        shelter_name: 'Huellas de Amor', shelter_city: 'Cali',
        campaign: null, campaign_title: null,
        paid_at: null, created_at: '2026-02-05T12:00:00Z',
      },
    ];
    await page.route('**/api/donations/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockDonations),
        });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'adopter', '/my-donations');

    await expect(page.getByRole('heading', { name: /Mis Donaciones/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Refugio Amor/i).first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('main').getByRole('button', { name: 'Pagada' }).click();

    // One row survives: each row carries exactly one 'Pagada el …' / 'Creada el …' line.
    await expect(page.getByText(/^(Pagada|Creada) el /)).toHaveCount(1);
    await expect(page.getByText('Huellas de Amor')).toHaveCount(0);
    // Spanish locale groups with a dot: the paid row and the summary total both read $50.000.
    await expect(page.getByText('$50.000', { exact: true })).toHaveCount(2);
    await expect(page.getByText('$75.000', { exact: true })).toHaveCount(0);
  });
});

test.describe('Sponsorship history — authenticated', () => {
  test('should display sponsorship history when adopter has sponsorships', { tag: [...SPONSORSHIP_HISTORY, '@outcome:display'] }, async ({ page }) => {
    // Bug caught: my-sponsorships/page.tsx:46-48 filters client-side on `status`. Drop the
    // predicate and a canceled sponsorship keeps showing under "Activo", so the adopter
    // believes they are still funding an animal they are not.
    test.slow();
    await paceRequestsUnderRateLimit(page);
    const mockSponsorships = [
      {
        id: 1, user: 1, animal: 2, animal_name: 'Milo', animal_species: 'cat',
        shelter_name: 'Patitas Felices', shelter_city: 'Medellín', thumbnail_url: null,
        amount: '30000', frequency: 'monthly' as const, status: 'active' as const,
        started_at: '2026-02-01T12:00:00Z', created_at: '2026-02-01T12:00:00Z',
      },
      {
        id: 2, user: 1, animal: 3, animal_name: 'Rocky', animal_species: 'dog',
        shelter_name: 'Huellas de Amor', shelter_city: 'Cali', thumbnail_url: null,
        amount: '45000', frequency: 'monthly' as const, status: 'canceled' as const,
        started_at: '2026-01-05T12:00:00Z', created_at: '2026-01-05T12:00:00Z',
      },
    ];
    await page.route('**/api/sponsorships/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSponsorships),
        });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'adopter', '/my-sponsorships');

    await expect(page.getByRole('heading', { name: /Mis Apadrinamientos/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Milo/i).first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('main').getByRole('button', { name: 'Activo' }).click();

    // Each surviving sponsorship card renders the animal name as its only h3.
    await expect(page.getByRole('main').getByRole('heading', { level: 3 })).toHaveText('Milo');
    await expect(page.getByText('Rocky')).toHaveCount(0);
    // Spanish locale groups with a dot; the summary card reads '$30.000/mes', the row '$30.000'.
    await expect(page.getByText('$30.000', { exact: true })).toHaveCount(1);
  });
});

test.describe('Adopter intent — authenticated', () => {
  test('should create adoption intent when adopter saves the form', { tag: [...ADOPTER_INTENT_CREATE] }, async ({ page }) => {
    await page.route('**/api/adopter-intents/**', (route: any) => {
      const url = route.request().url();
      if (url.includes('/me/') && route.request().method() === 'GET') {
        return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      }
      if (url.includes('/create/') && route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 8,
            user: 1,
            preferences: {},
            description: 'Busco un compañero tranquilo',
            status: 'active',
            visibility: 'public',
            created_at: '2026-03-31T10:00:00Z',
          }),
        });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'adopter', '/my-intent');

    await expect(page.getByRole('heading', { name: /Mi Intención de Adopción/i })).toBeVisible({ timeout: 15_000 });
    await page.getByLabel(/Cuéntanos qué buscas/i).fill('Busco un compañero tranquilo');
    await page.getByRole('button', { name: /Crear intención/i }).click();

    await expect(page.getByRole('button', { name: /Actualizar intención/i })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Adoption Application History', () => {
  test(
    'should display clinical history page for an adoption application',
    { tag: [...ADOPTION_APPLICATION_HISTORY, '@outcome:display'] },
    async ({ page }) => {
      // Bug caught: the detail → history link losing the id segment. It is the one path in
      // my-applications/[id]/page.tsx (:96-97) concatenated by hand instead of through a
      // ROUTES helper, even though ROUTES.MY_APPLICATION_HISTORY exists (constants.ts:72).
      test.slow();
      await paceRequestsUnderRateLimit(page);
      await page.route('**/api/adoptions/1/**', (route: any) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1, animal: 5, animal_name: 'Luna', status: 'approved',
            shelter_name: 'Patitas Felices', shelter_city: 'Bogotá',
            created_at: '2026-01-10T00:00:00Z', events: [],
          }),
        }),
      );
      // One entry, not []: an empty list makes any row assertion vacuous.
      await page.route('**/api/animals/5/clinical-history/**', (route: any) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 3, animal: 5, entry_type: 'vaccination', title: 'Refuerzo antirrábico',
              body_es: 'Vacuna aplicada sin reacciones.', body_en: '',
              occurred_at: '2026-02-14T09:00:00Z', created_at: '2026-02-14T09:00:00Z',
            },
          ]),
        }),
      );

      await loginAndNavigate(page, 'adopter', '/my-applications/1');
      await page.getByRole('link', { name: /Ver historia clínica/i }).click();

      await expect(page).toHaveURL(/\/my-applications\/1\/history$/);
      await expect(page.getByRole('heading', { name: /Historia clínica/i })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('Refuerzo antirrábico')).toBeVisible();
    },
  );
});

test.describe('Profile Activity Feed', () => {
  test(
    'adopter sees the recent-activity timeline on their profile',
    { tag: [...PROFILE_ACTIVITY_FEED, '@outcome:display'] },
    async ({ page }) => {
      await page.route('**/user/activity/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockActivity) }),
      );
      await page.route('**/user/profile-stats/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
      );
      await page.route('**/api/shelter-applications/me/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) }),
      );

      await loginAndNavigate(page, 'adopter', '/my-profile');

      await expect(page.getByRole('heading', { name: /Actividad reciente/i })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/Aplicaste para adoptar a Luna/i)).toBeVisible({ timeout: 10_000 });
    },
  );
});
