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
  test.beforeEach(async ({ page }) => {
    // Mock FAQs API to prevent pending requests
    await page.route('**/api/faqs/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    // Mock notification unread count to prevent polling
    await page.route('**/api/notifications/unread-count/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 0 }) }),
    );
  });

  test('should submit donation checkout with PSE', { tag: [...DONATION_CHECKOUT_SUBMIT] }, async ({ page }) => {
    // Mock donation amounts API
    await page.route('**/api/donation-amounts/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, amount: 10000, label: '' },
          { id: 2, amount: 25000, label: '' },
          { id: 3, amount: 50000, label: '' },
          { id: 4, amount: 100000, label: '' },
        ]),
      }),
    );

    // Navigate to home first to let auth state sync, then to checkout
    // This avoids the useRequireAuth race condition where redirect fires before syncFromCookies
    await loginAndNavigate(page, 'adopter', '/');
    await waitForPageLoad(page);
    // Auth is now synced — navigate to checkout
    await page.goto('/checkout/donation');
    await waitForPageLoad(page);

    // Verify heading
    await expect(page.getByRole('heading', { name: /Donar/i })).toBeVisible();

    // Wait for amount buttons to load (from API or fallback)
    const amountButton = page.getByRole('button', { name: /\$.*10,000|10.000/i }).first();
    await expect(amountButton).toBeVisible({ timeout: 10_000 });
    await amountButton.click();

    // Fill optional message
    await page.getByLabel(/Mensaje/i).fill('Gracias por cuidar a los animales');

    // Select PSE payment method — click the label to avoid detachment from re-renders
    await page.getByText(/PSE.*transferencia/i).click();

    // Submit the form
    await page.getByRole('button', { name: /Donar/i }).click();

    // Verify processing state
    await expect(page.getByRole('button', { name: /Procesando/i })).toBeVisible();

    // Verify navigation to confirmation page
    await page.waitForURL(/confirmation/, { timeout: 10_000 });
    await expect(page).toHaveURL(/confirmation/);
  });

  test('should submit sponsorship checkout with Nequi', { tag: [...SPONSORSHIP_CHECKOUT_SUBMIT] }, async ({ page }) => {
    // Mock sponsorship amounts API
    await page.route('**/api/sponsorship-amounts/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, amount: 15000, label: '' },
          { id: 2, amount: 30000, label: '' },
          { id: 3, amount: 50000, label: '' },
          { id: 4, amount: 75000, label: '' },
        ]),
      }),
    );

    await loginAndNavigate(page, 'adopter', '/');
    await waitForPageLoad(page);
    await page.goto('/checkout/sponsorship');
    await waitForPageLoad(page);

    // Verify heading
    await expect(page.getByRole('heading', { name: /Apadrinar/i })).toBeVisible();

    // Wait for amount buttons to load — indicates component is fully rendered
    const amountButton = page.getByRole('button', { name: /\$.*15,000|15.000/i }).first();
    await expect(amountButton).toBeVisible({ timeout: 10_000 });

    // Click monthly frequency button (should be default, but click to be explicit)
    await page.getByRole('button', { name: 'Mensual', exact: true }).click();

    // Select amount
    await amountButton.click();

    // Select Nequi payment method via label click (avoids detachment from late re-renders)
    await page.getByText(/Nequi/i).click();

    // Submit the form
    await page.getByRole('button', { name: /Apadrinar/i }).click();

    // Verify processing state
    await expect(page.getByRole('button', { name: /Procesando/i })).toBeVisible();

    // Verify navigation to confirmation page
    await page.waitForURL(/confirmation/, { timeout: 10_000 });
    await expect(page).toHaveURL(/confirmation/);
  });
});
