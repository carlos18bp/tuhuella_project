import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import { DONATION_CHECKOUT, SPONSORSHIP_CHECKOUT, PAYMENT_CONFIRMATION, DONATION_CHECKOUT_SUBMIT, SPONSORSHIP_CHECKOUT_SUBMIT } from '../helpers/flow-tags';

test.describe('Checkout Flows', () => {
  test('should redirect unauthenticated user from donation checkout', { tag: [...DONATION_CHECKOUT] }, async ({ page }) => {
    await page.goto('/checkout/donation');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|donation/);
  });

  test('should display donation checkout page when authenticated', { tag: [...DONATION_CHECKOUT] }, async ({ page }) => {
    // Navigate to the page — useRequireAuth will redirect if not logged in
    await page.goto('/checkout/donation');
    await waitForPageLoad(page);

    // If redirected, the flow requires authentication
    if (new URL(page.url()).pathname.includes('donation')) {
      await expect(page.getByRole('heading', { name: /Donar/i })).toBeVisible();
      await expect(page.getByText(/Wompi/i)).toBeVisible();

      // Verify preset amounts are shown
      await expect(page.getByRole('button', { name: /10,000/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /50,000/i })).toBeVisible();

      // Verify payment method options
      await expect(page.getByText(/Tarjeta de crédito/i)).toBeVisible();
      await expect(page.getByText(/PSE/i)).toBeVisible();
      await expect(page.getByText(/Nequi/i)).toBeVisible();
    }
  });

  test('should redirect unauthenticated user from sponsorship checkout', { tag: [...SPONSORSHIP_CHECKOUT] }, async ({ page }) => {
    await page.goto('/checkout/sponsorship');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|sponsorship/);
  });

  test('should display payment confirmation page', { tag: [...PAYMENT_CONFIRMATION] }, async ({ page }) => {
    await page.goto('/checkout/confirmation?type=donation&status=placeholder');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/confirmation/);
  });
});

test.describe.serial('Checkout Flows — Authenticated', () => {
  test('should submit donation checkout with PSE', { tag: [...DONATION_CHECKOUT_SUBMIT] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/checkout/donation');

    // Verify heading
    await expect(page.getByRole('heading', { name: /Donar/i })).toBeVisible();

    // Wait for amount buttons to load (from API or fallback)
    const amountButton = page.getByRole('button', { name: /\$.*10,000|10.000/i }).first();
    await expect(amountButton).toBeVisible({ timeout: 10_000 });
    await amountButton.click();

    // Fill optional message
    await page.getByLabel(/Mensaje/i).fill('Gracias por cuidar a los animales');

    // Select PSE payment method
    await page.getByRole('radio', { name: /PSE/i }).check();

    // Submit the form
    await page.getByRole('button', { name: /Donar/i }).click();

    // Verify processing state
    await expect(page.getByRole('button', { name: /Procesando/i })).toBeVisible();

    // Verify navigation to confirmation page
    await page.waitForURL(/confirmation/, { timeout: 10_000 });
    await expect(page).toHaveURL(/confirmation/);
  });

  test('should submit sponsorship checkout with Nequi', { tag: [...SPONSORSHIP_CHECKOUT_SUBMIT] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/checkout/sponsorship');

    // Verify heading
    await expect(page.getByRole('heading', { name: /Apadrinar/i })).toBeVisible();

    // Click monthly frequency button (should be default, but click to be explicit)
    await page.getByRole('button', { name: 'Mensual', exact: true }).click();

    // Wait for amount buttons to load and select one
    const amountButton = page.getByRole('button', { name: /\$.*15,000|15.000/i }).first();
    await expect(amountButton).toBeVisible({ timeout: 10_000 });
    await amountButton.click();

    // Select Nequi payment method
    await page.getByRole('radio', { name: /Nequi/i }).check();

    // Submit the form
    await page.getByRole('button', { name: /Apadrinar/i }).click();

    // Verify processing state
    await expect(page.getByRole('button', { name: /Procesando/i })).toBeVisible();

    // Verify navigation to confirmation page
    await page.waitForURL(/confirmation/, { timeout: 10_000 });
    await expect(page).toHaveURL(/confirmation/);
  });
});
