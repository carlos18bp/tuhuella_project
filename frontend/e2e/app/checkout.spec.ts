import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import { DONATION_CHECKOUT, SPONSORSHIP_CHECKOUT, PAYMENT_CONFIRMATION, DONATION_CHECKOUT_SUBMIT, SPONSORSHIP_CHECKOUT_SUBMIT, PLATFORM_SUPPORT_INFO, DONATION_PLATFORM_CHECKOUT } from '../helpers/flow-tags';
import { paceRequestsUnderRateLimit } from '../helpers/pacing';

test.describe('Checkout Flows', () => {
  test('should redirect unauthenticated user from donation checkout', { tag: [...DONATION_CHECKOUT] }, async ({ page }) => {
    await page.goto('/checkout/donation');
    await waitForPageLoad(page);

    // Donation checkout is a protected route — catches a regression where an
    // unauthenticated user reaches /checkout/donation instead of being sent to sign-in.
    await page.waitForURL(/\/sign-in/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from sponsorship checkout', { tag: [...SPONSORSHIP_CHECKOUT] }, async ({ page }) => {
    await page.goto('/checkout/sponsorship');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should display payment confirmation page', { tag: [...PAYMENT_CONFIRMATION] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    // Registered before loginAndNavigate so its auth mocks, which come after, win
    // for their own paths (Playwright matches route handlers in reverse order).
    await paceRequestsUnderRateLimit(page);

    // The whole /checkout prefix is gated server-side by proxy.ts PROTECTED_PREFIXES:
    // without an access_token cookie the confirmation URL 302s to /sign-in before the
    // page ever renders (that is exactly what the first test in this file asserts).
    // loginAndNavigate seeds the cookie and then navigates, so we land on the real page.
    await loginAndNavigate(page, 'adopter', '/checkout/confirmation?type=donation&status=approved');
    await waitForPageLoad(page);

    // Real success heading for a completed (non-placeholder) donation — catches a
    // regression where the confirmation page renders blank/placeholder copy for a
    // real payment status instead of the actual success message.
    await expect(page.getByRole('heading', { name: 'Donación registrada' })).toBeVisible();

    // The secondary CTA is type-dependent: confirmation/page.tsx:66-71 picks
    // ROUTES.MY_SPONSORSHIPS vs ROUTES.MY_DONATIONS off `isSponsorship`. Invert that
    // ternary and a donor lands on an empty sponsorships page — following the link is
    // the only way to see it, since both labels render as a perfectly valid button.
    await page.getByRole('link', { name: 'Ver mis donaciones' }).click();
    await expect(page).toHaveURL(/\/my-donations$/);
  });

  test('should offer a retry when a donation payment is declined', { tag: [...PAYMENT_CONFIRMATION, '@outcome:failure'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);

    // 'declined' is one of confirmation/page.tsx:14 FAILURE_STATUSES. Everything NOT in
    // that set and not 'placeholder' falls through to the success branch, so a gateway
    // status rename (declined → payment_declined) would tell a user whose card bounced
    // "Tu donación ha sido registrada exitosamente" (page.tsx:50). Nothing tested that.
    await loginAndNavigate(page, 'adopter', '/checkout/confirmation?type=donation&status=declined');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu donación no pudo procesarse');

    // The primary CTA must send a failed donor back to the donation checkout, not to
    // the animals listing it points at on success (page.tsx:60-65).
    await page.getByRole('link', { name: 'Intentar de nuevo' }).click();
    await expect(page).toHaveURL(/\/checkout\/donation$/);
  });
});

test.describe('Platform Support', () => {
  test('should display platform support info page', { tag: [...PLATFORM_SUPPORT_INFO] }, async ({ page }) => {
    // quality: allow-no-interaction (public-route guard, not a display test: it exists
    // only to prove /apoya-la-plataforma is NOT behind proxy.ts PROTECTED_PREFIXES, and
    // the redirect it guards against happens before any interaction is possible. The
    // UI-entry + CTA coverage of this flow lives in e2e/public/platform-support.spec.ts.)
    await page.goto('/apoya-la-plataforma');
    await waitForPageLoad(page);
    // Public page — should not redirect to sign-in
    await expect(page).not.toHaveURL(/sign-in/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  // The platform-checkout auth guard is NOT tested here. It lived in this file as a
  // byte-identical twin of e2e/public/platform-support.spec.ts 'redirects unauthenticated
  // user from platform checkout' — the suite's only duplicate_coverage finding. The copy
  // there is the one kept: its describe is named for the flow it owns
  // ('Platform Donation Checkout @flow:donation-platform-checkout') and also holds the
  // authenticated display and submit cases, so the guard sits with its siblings.
});

test.describe.serial('Checkout Flows — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    // Every test here loads '/' and then a /checkout page — ~80 requests with Next's
    // link prefetch, well over the deployed nginx zone (10 r/s, burst 20). Measured
    // against staging without this: 9 responses came back 429, the sponsorship page's
    // client chunk was one of them, so its useEffect never ran, /api/sponsorship-amounts/
    // was never even requested and the amount buttons never rendered. Registered first
    // so the endpoint mocks below still win for their own paths (reverse match order).
    test.slow();
    await paceRequestsUnderRateLimit(page);

    // Mock FAQs API to prevent pending requests
    await page.route('**/api/faqs/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    // Mock notification unread count to prevent polling
    await page.route('**/api/notifications/unread-count/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 0 }) }),
    );
  });

  test('should submit donation checkout with PSE', { tag: [...DONATION_CHECKOUT_SUBMIT, ...DONATION_CHECKOUT] }, async ({ page }) => {
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

  test('should submit platform donation checkout', { tag: [...DONATION_PLATFORM_CHECKOUT] }, async ({ page }) => {
    await page.route('**/api/donation-amounts/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, amount: 10000, label: '' },
          { id: 2, amount: 25000, label: '' },
          { id: 3, amount: 50000, label: '' },
        ]),
      }),
    );

    await loginAndNavigate(page, 'adopter', '/');
    await waitForPageLoad(page);
    await page.goto('/checkout/platform');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Select amount
    const amountButton = page.getByRole('button', { name: /\$.*10[,.]000/i }).first();
    await expect(amountButton).toBeVisible({ timeout: 10_000 });
    await amountButton.click();

    // Select PSE payment method
    await page.getByText(/PSE/i).click();

    // Submit
    await page.locator('button[type="submit"]').click();

    // Should redirect to confirmation
    await page.waitForURL(/confirmation/, { timeout: 10_000 });
    await expect(page).toHaveURL(/confirmation/);
  });

  test('should submit sponsorship checkout with Nequi', { tag: [...SPONSORSHIP_CHECKOUT_SUBMIT, ...SPONSORSHIP_CHECKOUT] }, async ({ page }) => {
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

    // The submit label is the only place the amount and the frequency meet before the
    // charge: page.tsx:124 renders `Apadrinar — $${Number(amount||0).toLocaleString()}${
    // frequency === 'monthly' ? '/mes' : ''}`. Drop `amount` from that template, or
    // invert the frequency ternary, and the form still submits — it just charges the
    // wrong thing. Nothing asserted the composed label until now. (The separator is a
    // dot, not a comma: playwright.config.ts:42 pins the browser locale to 'es'.)
    await expect(page.getByRole('button', { name: /^Apadrinar — / })).toHaveText('Apadrinar — $15.000/mes');

    // Submit the form
    await page.getByRole('button', { name: /Apadrinar/i }).click();

    // Verify processing state
    await expect(page.getByRole('button', { name: /Procesando/i })).toBeVisible();

    // Verify navigation to confirmation page
    await page.waitForURL(/confirmation/, { timeout: 10_000 });
    await expect(page).toHaveURL(/confirmation/);
  });
});
