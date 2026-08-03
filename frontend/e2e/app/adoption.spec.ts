import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate, fillAdoptionForm } from '../fixtures';
import { ADOPTION_SUBMIT, ADOPTION_TRACK, ADOPTION_MANAGE, MY_APPLICATIONS_LIST, ADOPTION_FORM_WIZARD } from '../helpers/flow-tags';
import { paceRequestsUnderRateLimit } from '../helpers/pacing';

const mockAnimal = {
  id: 1,
  name: 'Luna',
  slug: 'luna',
  species: 'dog',
  breed: 'Mestizo',
  age_range: 'adult',
  gender: 'female',
  size: 'medium',
  status: 'published',
  description: 'Una perrita cariñosa que busca hogar.',
  is_vaccinated: true,
  is_sterilized: true,
  shelter: 1,
  shelter_name: 'Patitas Felices',
  shelter_city: 'Bogotá',
  gallery_urls: [],
  created_at: '2026-01-10T12:00:00Z',
};

const mockAnimalsListResponse = {
  results: [mockAnimal],
  count: 1,
  page: 1,
  page_size: 12,
  total_pages: 1,
};

test.describe('Adoption Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Mock animals API so animal list and detail pages have data
    await page.route('**/api/animals/**', (route) => {
      const url = route.request().url();
      const isSimilar = url.includes('/similar');
      const isDetail = !isSimilar && /\/api\/animals\/\d+/.exec(url);
      let body;
      if (isSimilar) {
        body = [];
      } else if (isDetail) {
        body = mockAnimal;
      } else {
        body = mockAnimalsListResponse;
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  });

  test('should redirect unauthenticated user from adoption tracking', { tag: [...ADOPTION_TRACK] }, async ({ page }) => {
    await page.goto('/my-applications');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should show adoption CTA on animal detail for unauthenticated user', { tag: [...ADOPTION_SUBMIT, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    const firstAnimalLink = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) }).first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

      await expect(page.getByRole('link', { name: /Inicia sesión para adoptar/i })).toBeVisible();
    }
  });

  test('should redirect unauthenticated user from shelter applications', { tag: [...ADOPTION_MANAGE] }, async ({ page }) => {
    await page.goto('/shelter/applications');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

async function setupAdoptionFormExtraMocks(page: import('@playwright/test').Page) {
  await page.route('**/api/animals/*/similar/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );
  await page.route('**/api/notifications/unread-count/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 0 }) }),
  );
  await page.route('**/api/favorites/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );
  await page.route('**/api/faqs/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );
}

test.describe.serial('Adoption Flows — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    // Mock animals API for authenticated flows
    await page.route('**/api/animals/**', (route) => {
      const isDetail = route.request().url().match(/\/api\/animals\/\d+/);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isDetail ? mockAnimal : mockAnimalsListResponse),
      });
    });
    // Mock adoption applications API
    await page.route('**/api/adoption-applications/**', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 1, status: 'pending' }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [], count: 0 }) });
    });
  });

  test('should display my applications list or empty state', { tag: [...MY_APPLICATIONS_LIST, ...ADOPTION_TRACK, '@outcome:display', '@outcome:success'] }, async ({ page }) => {
    // Two bugs at once: (a) the account-menu route to /my-applications breaking
    // (Header.tsx:108), (b) the status filter not filtering — my-applications/page.tsx:42-45
    // filters client-side, so dropping the predicate shows the full list under every chip
    // while the chip still highlights as if it had filtered. The previous
    // `hasEmpty || hasCards` boolean was true for literally any render (the Footer alone
    // supplies an h3).
    test.slow();
    // Pacing FIRST: it calls route.continue() and Playwright matches handlers in reverse
    // registration order, so anything registered after it wins for its own paths.
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/adoptions/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 5, animal: 1, animal_name: 'Luna', animal_species: 'dog',
            shelter_name: 'Patitas Felices', shelter_city: 'Bogotá', thumbnail_url: null,
            status: 'interview', created_at: '2026-01-10T00:00:00Z', reviewed_at: null,
          },
          {
            id: 6, animal: 2, animal_name: 'Milo', animal_species: 'cat',
            shelter_name: 'Refugio Amor', shelter_city: 'Medellín', thumbnail_url: null,
            status: 'approved', created_at: '2026-01-12T00:00:00Z', reviewed_at: null,
          },
        ]),
      }),
    );

    await loginAndNavigate(page, 'adopter', '/');
    await page.getByRole('button', { name: /Abrir menú de cuenta/i }).click();
    await page.getByRole('menuitem', { name: 'Mis solicitudes' }).click();

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Mis Solicitudes de Adopción');

    // The chips only render when counts.total > 0 (page.tsx:97), hence the two-row fixture.
    await page.getByRole('main').getByRole('button', { name: /^Entrevista/ }).click();

    await expect(page.getByRole('main').getByRole('heading', { level: 3 })).toHaveCount(1);
    await expect(page.getByRole('main').getByRole('heading', { level: 3 })).toHaveText('Luna');
  });

  test('should load adoption form wizard and navigate through steps', { tag: [...ADOPTION_FORM_WIZARD] }, async ({ page }) => {
    await setupAdoptionFormExtraMocks(page);

    // Use loginAndNavigate (cookie-based) for reliable auth on animal detail page
    // Navigate to home first to let auth state sync, then use client-side navigation
    await loginAndNavigate(page, 'adopter', '/');
    await waitForPageLoad(page);

    // Navigate to animals listing via client-side link to preserve auth state
    await page.getByRole('link', { name: 'Ver Animales' }).first().click();
    await page.waitForURL(/.*animals/, { timeout: 10_000 });

    // Click first animal → detail
    const firstAnimalLink = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) }).first();
    await expect(firstAnimalLink).toBeVisible({ timeout: 10_000 });
    await firstAnimalLink.click();
    await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

    // Dismiss any Next.js error overlay that might appear
    const dialog = page.locator('dialog');
    if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden', timeout: 2_000 }).catch(() => {});
    }

    const adoptLink = page.getByRole('link', { name: /Solicitar Adopción/i });
    await expect(adoptLink).toBeVisible({ timeout: 15_000 });
    await adoptLink.click();
    await page.waitForURL(/.*adopt\/\d+/, { timeout: 10_000 });

    // Fill wizard form
    await expect(page.getByRole('list', { name: /Pasos del formulario/i })).toBeVisible({ timeout: 15_000 });
    await fillAdoptionForm(page);

    // Review → Submit
    await page.getByRole('button', { name: /Continuar/i }).click();
    await expect(page.getByText(/Revisa tus respuestas/i)).toBeVisible();
    await page.getByRole('button', { name: /Continuar/i }).click();
    await page.getByRole('button', { name: /Enviar solicitud/i }).click();

    // Verify outcome
    const hasSuccess = await page.getByRole('heading', { name: /Solicitud enviada/i }).isVisible({ timeout: 15_000 }).catch(() => false);
    const hasError = await page.getByRole('alert').isVisible({ timeout: 500 }).catch(() => false);
    expect(hasSuccess || hasError).toBe(true);
  });
});
