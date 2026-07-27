import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { PUBLIC_CONTACT } from '../helpers/flow-tags';

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/google-captcha/site-key/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ site_key: '' }),
      }),
    );
    await page.route('**/api/contact/**', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Your message was sent successfully.' }),
        });
      }
      return route.continue();
    });
  });

  test('should display contact page with form and WhatsApp', { tag: [...PUBLIC_CONTACT, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (public display render of the contact form; the submit interaction belongs to the success/error tests of this flow)
    await page.goto('/contactanos');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Contáctanos/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /WhatsApp/i })).toBeVisible();
    await expect(page.getByLabel(/Nombre/i)).toBeVisible();
  });

  test('should show success after submitting the form', { tag: [...PUBLIC_CONTACT] }, async ({ page }) => {
    await page.goto('/contactanos');
    await waitForPageLoad(page);

    await page.getByLabel(/Nombre/i).fill('Usuario E2E');
    await page.getByLabel(/Correo electrónico/i).fill('e2e-contact@example.com');
    await page.getByLabel(/Asunto/i).fill('Prueba automatizada');
    await page.getByLabel(/Mensaje/i).fill('Cuerpo del mensaje de prueba para el formulario de contacto.');
    await page.getByRole('button', { name: /Enviar mensaje/i }).click();

    await expect(page.getByRole('heading', { name: /Mensaje enviado/i })).toBeVisible();
  });

  test('shows the field error returned by the contact API', { tag: [...PUBLIC_CONTACT, '@outcome:error'] }, async ({ page }) => {
    // Registered after the beforeEach's default 201 so it wins for this test's POST.
    await page.route('**/api/contact/**', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ email: ['Correo inválido'] }),
        });
      }
      return route.continue();
    });

    await page.goto('/contactanos');
    await waitForPageLoad(page);

    // Native `required` blocks an empty-form submit before any request fires, so this
    // fills every field with valid data and lets the API response drive the field error
    // (contactanos/page.tsx:79-89).
    await page.getByLabel(/Nombre/i).fill('Usuario E2E');
    await page.getByLabel(/Correo electrónico/i).fill('usuario-e2e@example.com');
    await page.getByLabel(/Asunto/i).fill('Prueba automatizada');
    await page.getByLabel(/Mensaje/i).fill('Cuerpo del mensaje de prueba para el formulario de contacto.');
    await page.getByRole('button', { name: /Enviar mensaje/i }).click();

    await expect(page.getByText('Correo inválido')).toBeVisible({ timeout: 10_000 });
  });

  test('shows the send-unavailable message when the contact API returns 503', { tag: [...PUBLIC_CONTACT, '@outcome:failure'] }, async ({ page }) => {
    await page.route('**/api/contact/**', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Service unavailable' }),
        });
      }
      return route.continue();
    });

    await page.goto('/contactanos');
    await waitForPageLoad(page);

    await page.getByLabel(/Nombre/i).fill('Usuario E2E');
    await page.getByLabel(/Correo electrónico/i).fill('usuario-e2e@example.com');
    await page.getByLabel(/Asunto/i).fill('Prueba automatizada');
    await page.getByLabel(/Mensaje/i).fill('Cuerpo del mensaje de prueba para el formulario de contacto.');
    await page.getByRole('button', { name: /Enviar mensaje/i }).click();

    await expect(
      page.getByText('El envío de correo no está disponible en este momento. Intenta más tarde.'),
    ).toBeVisible({ timeout: 10_000 });
  });
});
