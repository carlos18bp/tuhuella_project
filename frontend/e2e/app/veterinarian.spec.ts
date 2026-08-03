import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import { VET_FOLLOW_UPS_LIST, VET_FOLLOW_UP_DETAIL, VETERINARIAN_PROFILE } from '../helpers/flow-tags';
import { mockFollowUps, mockFollowUpDetail, mockProfileStats, mockActivity } from '../helpers/mock-data';
import { paceRequestsUnderRateLimit } from '../helpers/pacing';

test.describe('Veterinarian — Unauthenticated', () => {
  test('should redirect unauthenticated user from follow-ups list', { tag: [...VET_FOLLOW_UPS_LIST] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    await page.goto('/veterinarian/follow-ups');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from follow-up detail', { tag: [...VET_FOLLOW_UP_DETAIL] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    await page.goto('/veterinarian/follow-ups/1');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Veterinarian — Follow-Ups List', () => {
  test('should show access denied for adopter role', { tag: [...VET_FOLLOW_UPS_LIST, '@outcome:display'] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    await loginAndNavigate(page, 'adopter', '/veterinarian/follow-ups');

    await expect(page.getByText(/Acceso denegado/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should display follow-ups list with animal cards for admin user', { tag: [...VET_FOLLOW_UPS_LIST, '@outcome:display'] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/follow-ups/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUps) }),
    );

    await loginAndNavigate(page, 'admin', '/veterinarian/follow-ups');

    await expect(page.getByRole('heading', { name: /Seguimientos asignados/i, level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Luna')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Milo')).toBeVisible({ timeout: 10_000 });
  });

  test('should show empty state when no follow-ups are assigned', { tag: [...VET_FOLLOW_UPS_LIST, '@outcome:display'] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/follow-ups/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await loginAndNavigate(page, 'admin', '/veterinarian/follow-ups');

    await expect(page.getByText(/No tienes seguimientos asignados/i)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Veterinarian — Follow-Up Detail', () => {
  // Arrives by walking the list → detail edge instead of deep-linking /1, so a broken
  // row href (wrong id, lost locale prefix) fails here. follow-ups/page.tsx:46-47 builds
  // ROUTES.VET_FOLLOW_UP_DETAIL(f.id) and nothing else in the suite exercises that link:
  // a deep-linked test stays green while every vet in the product lands on a 404.
  test('should display follow-up detail with animal name and clinical history', { tag: [...VET_FOLLOW_UP_DETAIL, '@outcome:display'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);

    await page.route('**/api/follow-ups/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUps) }),
    );
    // Registered after the list mock so it wins for the detail path: Playwright matches
    // route handlers in reverse registration order.
    await page.route('**/api/follow-ups/1/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUpDetail) }),
    );

    await loginAndNavigate(page, 'admin', '/veterinarian/follow-ups');

    await page.getByRole('link', { name: /Luna/ }).click({ timeout: 20_000 });
    await page.waitForURL(/\/veterinarian\/follow-ups\/\d+$/, { timeout: 20_000 });

    await expect(page).toHaveURL(/\/veterinarian\/follow-ups\/\d+$/);
    await expect(page.getByRole('heading', { name: 'Luna', level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /Historia clínica/i, level: 2 })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Primera revisión')).toBeVisible({ timeout: 10_000 });
  });

  test('should show mark-complete button when follow-up status is pending', { tag: [...VET_FOLLOW_UP_DETAIL, '@outcome:display'] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/follow-ups/1/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUpDetail) }),
    );

    await loginAndNavigate(page, 'admin', '/veterinarian/follow-ups/1');

    await expect(page.getByRole('button', { name: /Marcar como completado/i })).toBeVisible({ timeout: 15_000 });
  });

  // Catches markComplete dropping the response write-back. followUpStore.ts:57-62 sets
  // `detail: res.data`, and the button's whole existence is `detail.status !== 'completed'`
  // (detail page :81). Break the write-back and the vet clicks "complete" forever with no
  // feedback, double-firing the PATCH — nothing else in the suite would notice.
  test('should hide the mark-complete button once the follow-up is completed', { tag: [...VET_FOLLOW_UP_DETAIL, '@outcome:success'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);

    let completeMethod = '';
    await page.route('**/api/follow-ups/1/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUpDetail) }),
    );
    // Registered last so it wins over the detail mock above for its own path.
    await page.route('**/api/follow-ups/1/complete/**', (route: any) => {
      completeMethod = route.request().method();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockFollowUpDetail, status: 'completed', completed_date: '2026-05-21T00:00:00Z' }),
      });
    });

    await loginAndNavigate(page, 'admin', '/veterinarian/follow-ups/1');

    const completeButton = page.getByRole('button', { name: 'Marcar como completado' });
    await expect(completeButton).toBeVisible({ timeout: 15_000 });
    await completeButton.click();

    await expect.poll(() => completeMethod, { timeout: 10_000 }).toBe('PATCH');
    await expect(completeButton).toHaveCount(0);
    await expect(page.getByRole('main').locator('header p')).toContainText('Completado');
  });
});

const vetMockUser = { id: 10, email: 'vet-e2e@example.com', first_name: 'Marco', last_name: 'Ríos', role: 'veterinarian', is_staff: false, is_active: true };

async function setupVetProfile(page: any) {
  await page.route('**/api/auth/validate_token/**', (route: any) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: vetMockUser }) }),
  );
  await page.route('**/api/token/refresh/**', (route: any) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access: 'e2e-mock-access-token', refresh: 'e2e-mock-refresh-token' }) }),
  );
  await page.route('**/user/profile-stats/**', (route: any) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
  );
  await page.route('**/user/activity/**', (route: any) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockActivity) }),
  );
  await page.route('**/api/notifications/unread-count/**', (route: any) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unread_count: 0 }) }),
  );
  // Derive the cookie URL from the same env var that drives `baseURL` (see
  // playwright.config.ts) instead of hardcoding domain: 'localhost'. A fixed
  // 'localhost' domain silently fails to attach when PLAYWRIGHT_BASE_URL points at a
  // remote host — the cookie domain never matches the navigated-to origin and the app
  // treats the session as unauthenticated. Same bug, same fix as fixtures.ts:160-170
  // for loginAndNavigate. No behavior change locally (unset still means localhost:3000).
  const cookieBaseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  await page.context().addCookies([
    { name: 'access_token', value: 'e2e-mock-access-token', url: cookieBaseUrl },
    { name: 'refresh_token', value: 'e2e-mock-refresh-token', url: cookieBaseUrl },
  ]);
}

test.describe('Veterinarian — Panel Entry', () => {
  // The header role panel is the ONLY in-app route a veterinarian has to their queue:
  // Header.tsx:773 wires { label: t('followUps'), href: ROUTES.VET_FOLLOW_UPS }. Because
  // that panel has exactly one item, Header.tsx:266-274 renders it as a single Link
  // labelled t('veterinarianPanel') — drop or misroute it and the queue becomes
  // URL-typing-only, which no deep-linked list test would ever catch.
  test('should reach the follow-ups list from the header veterinarian panel link', { tag: [...VET_FOLLOW_UPS_LIST, '@outcome:display'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);
    await setupVetProfile(page);
    await page.route('**/api/follow-ups/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUps) }),
    );

    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Panel Veterinario' }).click({ timeout: 20_000 });
    await page.waitForURL(/\/veterinarian\/follow-ups$/, { timeout: 20_000 });

    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText('Seguimientos asignados');
    await expect(page.getByRole('main').getByText('Luna')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('main').getByText('Milo')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Veterinarian — Profile', () => {
  test(
    'should display profile page for veterinarian with common profile elements',
    { tag: [...VETERINARIAN_PROFILE, '@outcome:display'] },
    async ({ page }) => {
      await paceRequestsUnderRateLimit(page);
      await setupVetProfile(page);
      await page.goto('/my-profile');
      await waitForPageLoad(page);

      const profileName = page.getByText(/Marco/i);
      const profileHeading = page.getByRole('heading', { name: /perfil|profile/i });
      await expect(profileName.or(profileHeading)).toBeVisible({ timeout: 15_000 });
    },
  );

  test(
    'should show VeterinarianProfileSection heading and stat cards',
    { tag: [...VETERINARIAN_PROFILE, '@outcome:display'] },
    async ({ page }) => {
      await paceRequestsUnderRateLimit(page);
      await setupVetProfile(page);
      await page.route('**/api/follow-ups/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUps) }),
      );

      await page.goto('/my-profile');
      await waitForPageLoad(page);

      await expect(page.getByText(/Responsabilidades del veterinario/i)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/Seguimientos asignados/i).first()).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('Pendiente')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('En curso')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('Completado')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('Vencido')).toBeVisible({ timeout: 10_000 });
    },
  );

  test(
    'should show follow-up quick action link in VeterinarianProfileSection',
    { tag: [...VETERINARIAN_PROFILE, '@outcome:display'] },
    async ({ page }) => {
      test.slow(); // paced requests trade wall time for a deterministic transition
      await paceRequestsUnderRateLimit(page);
      await setupVetProfile(page);
      await page.route('**/api/follow-ups/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
      );

      await page.goto('/my-profile');
      await waitForPageLoad(page);

      // Following the link is the point: VeterinarianProfileSection.tsx:117-128 is the only
      // route from the vet's profile into their work queue, and a wrong href there strands
      // the vet on a page that still renders a perfectly visible button.
      const quickAction = page.getByRole('link', { name: /Seguimientos/i });
      await expect(quickAction).toBeVisible({ timeout: 15_000 });
      await quickAction.click();

      await expect(page).toHaveURL(/\/veterinarian\/follow-ups$/);
    },
  );
});
