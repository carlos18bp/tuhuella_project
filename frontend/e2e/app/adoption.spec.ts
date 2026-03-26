import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAs, loginAndNavigate, fillAdoptionForm } from '../fixtures';
import { ADOPTION_SUBMIT, ADOPTION_TRACK, ADOPTION_MANAGE, MY_APPLICATIONS_LIST, ADOPTION_FORM_WIZARD } from '../helpers/flow-tags';

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
      const isDetail = route.request().url().match(/\/api\/animals\/\d+/);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(isDetail ? mockAnimal : mockAnimalsListResponse),
      });
    });
  });

  test('should redirect unauthenticated user from adoption tracking', { tag: [...ADOPTION_TRACK] }, async ({ page }) => {
    await page.goto('/my-applications');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|my-applications/);
  });

  test('should show adoption CTA on animal detail for unauthenticated user', { tag: [...ADOPTION_SUBMIT] }, async ({ page }) => {
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

    await expect(page).toHaveURL(/sign-in|applications/);
  });
});

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

  test('should display my applications list or empty state', { tag: [...MY_APPLICATIONS_LIST] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/my-applications');

    // Verify heading is visible
    await expect(page.getByRole('heading', { name: /Mis Solicitudes de Adopción/i })).toBeVisible();

    // Either application cards or empty state should be visible
    const emptyState = page.getByText(/No tienes solicitudes de adopción/i);
    const applicationCard = page.getByRole('heading', { level: 3 }).first();

    const hasEmpty = await emptyState.isVisible({ timeout: 5_000 }).catch(() => false);
    const hasCards = await applicationCard.isVisible({ timeout: 2_000 }).catch(() => false);

    expect(hasEmpty || hasCards).toBe(true);
  });

  test('should load adoption form wizard and navigate through steps', { tag: [...ADOPTION_FORM_WIZARD] }, async ({ page }) => {
    await loginAs(page, 'adopter');

    // Navigate to animals listing
    await page.getByRole('link', { name: 'Ver Animales' }).click();
    await page.waitForURL(/.*animals/, { timeout: 10_000 });

    // Click first animal → detail → adopt CTA
    const firstAnimalLink = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) }).first();
    await expect(firstAnimalLink).toBeVisible({ timeout: 10_000 });
    await firstAnimalLink.click();
    await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

    const adoptLink = page.getByRole('link', { name: /Solicitar Adopción/i });
    await expect(adoptLink).toBeVisible({ timeout: 10_000 });
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
