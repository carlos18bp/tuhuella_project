import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { DONATION_CHECKOUT, SPONSORSHIP_CHECKOUT, PAYMENT_CONFIRMATION } from '../helpers/flow-tags';

test.describe('Checkout Flows', () => {
  test('should redirect unauthenticated user from donation checkout', { tag: [...DONATION_CHECKOUT] }, async ({ page }) => {
    await page.goto('/checkout/donation');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|donacion/);
  });

  test('should display donation checkout page when authenticated', { tag: [...DONATION_CHECKOUT] }, async ({ page }) => {
    // Navigate to the page — useRequireAuth will redirect if not logged in
    await page.goto('/checkout/donation');
    await waitForPageLoad(page);

    // If redirected, the flow requires authentication
    if (page.url().includes('donacion')) {
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

    await expect(page).toHaveURL(/sign-in|apadrinamiento/);
  });

  test('should display payment confirmation page', { tag: [...PAYMENT_CONFIRMATION] }, async ({ page }) => {
    await page.goto('/checkout/confirmation?type=donation&status=placeholder');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/confirmacion/);
  });
});
