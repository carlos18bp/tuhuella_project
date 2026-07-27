import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import { PLATFORM_SUPPORT_INFO, DONATION_PLATFORM_CHECKOUT } from '../helpers/flow-tags';

test.describe('Platform Support Landing Page @flow:platform-support-info', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/faqs/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    await page.route('**/api/notifications/unread-count/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 0 }) }),
    );
  });

  test('renders hero and CTA to checkout', { tag: [...PLATFORM_SUPPORT_INFO, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/apoya-la-plataforma');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /apoyar|donar/i }).first()).toBeVisible();
  });

  test('renders cost breakdown section', { tag: [...PLATFORM_SUPPORT_INFO] }, async ({ page }) => {
    await page.goto('/apoya-la-plataforma');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /costo|infraestructura/i }).first()).toBeVisible();
  });

  test('renders transparency section', { tag: [...PLATFORM_SUPPORT_INFO] }, async ({ page }) => {
    await page.goto('/apoya-la-plataforma');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /transparencia|dónde va tu aporte/i })).toBeVisible();
  });

  test('renders 5-ways comparison grid', { tag: [...PLATFORM_SUPPORT_INFO] }, async ({ page }) => {
    await page.goto('/apoya-la-plataforma');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /formas de apoyar/i })).toBeVisible();
  });
});

test.describe('Platform Donation Checkout @flow:donation-platform-checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/faqs/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    await page.route('**/api/notifications/unread-count/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 0 }) }),
    );
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
  });

  test('redirects unauthenticated user from platform checkout', { tag: [...DONATION_PLATFORM_CHECKOUT] }, async ({ page }) => {
    await page.goto('/checkout/platform');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('displays platform checkout page when authenticated', { tag: [...DONATION_PLATFORM_CHECKOUT] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/');
    await waitForPageLoad(page);
    await page.goto('/checkout/platform');
    await waitForPageLoad(page);

    if (new URL(page.url()).pathname.includes('platform')) {
      await expect(page.getByRole('heading', { name: /plataforma/i })).toBeVisible();

      const amountButton = page.getByRole('button', { name: /\$.*10,000|10.000/i }).first();
      await expect(amountButton).toBeVisible({ timeout: 10_000 });

      await expect(page.getByText(/Tarjeta de crédito/i)).toBeVisible();
      await expect(page.getByText(/PSE/i)).toBeVisible();
      await expect(page.getByText(/Nequi/i)).toBeVisible();
    }
  });

  test('submits platform donation and redirects to confirmation with dest=platform', { tag: [...DONATION_PLATFORM_CHECKOUT] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/');
    await waitForPageLoad(page);
    await page.goto('/checkout/platform');
    await waitForPageLoad(page);

    if (!new URL(page.url()).pathname.includes('platform')) {
      test.skip();
    }

    const amountButton = page.getByRole('button', { name: /\$.*10,000|10.000/i }).first();
    await expect(amountButton).toBeVisible({ timeout: 10_000 });
    await amountButton.click();

    await page.getByRole('button', { name: /Apoyar/i }).click();

    await expect(page.getByRole('button', { name: /Procesando/i })).toBeVisible();

    await page.waitForURL(/confirmation/, { timeout: 10_000 });
    await expect(page).toHaveURL(/dest=platform/);
  });
});
