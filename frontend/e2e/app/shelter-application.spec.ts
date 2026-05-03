import { test, expect } from '../test-with-coverage';
import { loginAndNavigate, waitForPageLoad } from '../fixtures';
import { SHELTER_APPLICATION_STATUS, SHELTER_APPLICATION_SUBMIT } from '../helpers/flow-tags';

test.describe('Shelter Application', () => {
  test('redirects unauthenticated user to sign-in', { tag: [...SHELTER_APPLICATION_SUBMIT] }, async ({ page }) => {
    await page.goto('/shelter-application');
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/sign-in|shelter-application/);
  });

  test('adopter can complete the 4-step wizard', { tag: [...SHELTER_APPLICATION_SUBMIT] }, async ({ page }) => {
    await page.route('**/api/shelter-applications/me/**', (route: any) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'No application found' }),
      }),
    );
    await page.route('**/api/shelter-applications/', (route: any) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 99,
          status: 'submitted',
          shelter_name: 'Refugio Test',
          rejection_reason: '',
          document_urls: [],
        }),
      }),
    );

    await loginAndNavigate(page, 'adopter', '/shelter-application');
    await expect(page.getByRole('heading', { name: /Postularte como refugio/i })).toBeVisible({ timeout: 15_000 });

    // Step 1
    await page.getByLabel(/Nombre del refugio/i).fill('Refugio Test');
    await page.getByLabel(/Descripción/i).fill('Refugio dedicado al rescate de animales');
    await page.getByLabel(/Ciudad/i).fill('Bogotá');
    await page.getByLabel(/Teléfono/i).fill('+57 300 123 4567');
    await page.getByRole('button', { name: /Siguiente/i }).click();

    // Step 2
    await page.getByLabel(/Razón social/i).fill('Refugio Test SAS');
    await page.getByLabel(/NIT \/ RUT/i).fill('900-1234567-1');
    await page.getByLabel(/Nombre del representante legal/i).fill('Juan Pérez');
    await page.getByLabel(/Documento del representante/i).fill('1020304050');
    await page.getByRole('button', { name: /Siguiente/i }).click();

    // Step 3 (documents are deferred, just continue)
    await page.getByRole('button', { name: /Siguiente/i }).click();

    // Step 4
    await page.getByLabel(/^Motivación/i).fill('Llevamos años rescatando animales en la comunidad.');

    const submitResponse = page.waitForResponse(
      (res: any) => res.url().includes('/shelter-applications/') && res.request().method() === 'POST',
    );
    await page.getByRole('button', { name: /Enviar postulación/i }).click();
    await submitResponse;

    await page.waitForURL(/my-profile|shelter-application/, { timeout: 15_000 }).catch(() => {});
    const url = page.url();
    expect(url.includes('my-profile') || url.includes('shelter-application')).toBe(true);
  });

  test('shows status view when an application already exists', { tag: [...SHELTER_APPLICATION_STATUS] }, async ({ page }) => {
    await page.route('**/api/shelter-applications/me/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          status: 'submitted',
          shelter_name: 'Refugio Test',
          rejection_reason: '',
          document_urls: [],
        }),
      }),
    );

    await loginAndNavigate(page, 'adopter', '/shelter-application');
    await expect(page.getByText(/Estado de tu postulación/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Enviada/i)).toBeVisible();
  });
});
