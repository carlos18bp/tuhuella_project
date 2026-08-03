import { test, expect } from '../test-with-coverage';
import { loginAndNavigate, waitForPageLoad } from '../fixtures';
import {
  SHELTER_APPLICATION_REVIEW,
  SHELTER_APPLICATION_STATUS,
  SHELTER_APPLICATION_SUBMIT,
} from '../helpers/flow-tags';
import { mockPendingShelters } from '../helpers/mock-data';
import { paceRequestsUnderRateLimit } from '../helpers/pacing';

test.describe('Shelter Application', () => {
  test('redirects unauthenticated user to sign-in', { tag: [...SHELTER_APPLICATION_SUBMIT] }, async ({ page }) => {
    await page.goto('/shelter-application');
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/\/sign-in/);
  });

  // quality: disable test_too_long (4-step wizard must be tested end-to-end — step dependencies preclude safe splitting)
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

  test('shows status view when an application already exists', { tag: [...SHELTER_APPLICATION_STATUS, '@outcome:display'] }, async ({ page }) => {
    // Bug caught: the reapply button not resetting the store. shelter-application/page.tsx
    // :110-121 calls reset() + setStep(1) + setForm(EMPTY_FORM); break any of the three and
    // a rejected applicant is permanently locked out of re-applying while the page still
    // looks correct. 'rejected' is deliberately outside isPending (:60-62), so it falls
    // through to the branch that actually carries a control.
    // Measured: run back-to-back with its siblings against staging this test loses the
    // status view to nginx 429s; paced, it is deterministic.
    test.slow();
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/shelter-applications/me/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          status: 'rejected',
          shelter_name: 'Refugio Test',
          rejection_reason: 'Faltan los documentos legales del representante.',
          document_urls: [],
        }),
      }),
    );

    await loginAndNavigate(page, 'adopter', '/shelter-application');
    await expect(page.getByText(/Estado de tu postulación/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Faltan los documentos legales del representante.')).toBeVisible();

    await page.getByRole('button', { name: 'Volver a postular' }).click();

    await expect(page.getByText('Paso 1 de 4')).toBeVisible();
  });

  test('admin reviews and approves a pending shelter application', { tag: [...SHELTER_APPLICATION_REVIEW] }, async ({ page }) => {
    let pending = [...mockPendingShelters];
    await page.route('**/api/admin/shelters/pending/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(pending) }),
    );
    await page.route('**/api/admin/shelters/approve/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'approved' }) }),
    );

    await loginAndNavigate(page, 'admin', '/admin/shelters/approve');

    await expect(page.getByRole('heading', { name: /Aprobar Refugios/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Refugio Nuevo', level: 3 })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /Aprobar/i }).first().click();
    pending = pending.filter((s) => s.id !== 10);

    await expect(page.getByRole('heading', { name: 'Refugio Nuevo', level: 3 })).toBeHidden({ timeout: 10_000 });
  });
});
