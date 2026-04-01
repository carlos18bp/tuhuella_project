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

  test('should display contact page with form and WhatsApp', { tag: [...PUBLIC_CONTACT] }, async ({ page }) => {
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
});
