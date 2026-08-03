import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  ADMIN_DASHBOARD,
  ADMIN_APPROVE_SHELTERS,
  ADMIN_MODERATION,
  ADMIN_METRICS,
  ADMIN_PAYMENTS,
  ADMIN_PROFILE,
} from '../helpers/flow-tags';
import {
  mockPendingShelters,
  mockMetrics,
  mockPayments,
  mockModerationAnimals,
  mockModerationShelters,
} from '../helpers/mock-data';

test.describe('Admin Panel — Unauthenticated', () => {
  test('should redirect unauthenticated user from admin dashboard', { tag: [...ADMIN_DASHBOARD] }, async ({ page }) => {
    await page.goto('/admin/dashboard');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from approve shelters', { tag: [...ADMIN_APPROVE_SHELTERS] }, async ({ page }) => {
    await page.goto('/admin/shelters/approve');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from moderation', { tag: [...ADMIN_MODERATION] }, async ({ page }) => {
    await page.goto('/admin/moderation');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from metrics', { tag: [...ADMIN_METRICS] }, async ({ page }) => {
    await page.goto('/admin/metrics');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from payments', { tag: [...ADMIN_PAYMENTS] }, async ({ page }) => {
    await page.goto('/admin/payments');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Admin Panel — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display approve shelters page with pending list', { tag: [...ADMIN_APPROVE_SHELTERS, '@outcome:display'] }, async ({ page }) => {
    const pendingResponse = page.waitForResponse((res: any) => res.url().includes('/admin/shelters/pending'));
    await page.route('**/api/admin/shelters/pending/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPendingShelters),
      }),
    );

    // Entered through the Admin panel menu rather than by URL: for a display flow
    // reachability is part of what is under test, and a moderation queue no admin can
    // navigate to is broken however well the page itself renders.
    await loginAndNavigate(page, 'admin', '/');

    const adminPanel = page.getByRole('button', { name: 'Admin' });
    await expect(adminPanel).toBeVisible({ timeout: 15_000 });
    await adminPanel.click();
    await page.getByRole('menuitem', { name: /Aprobar refugios/i }).click();
    await page.waitForURL(/\/admin\/shelters\/approve/, { timeout: 15_000 });
    await pendingResponse;

    await expect(page.getByRole('heading', { name: /Aprobar Refugios/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Refugio Nuevo', level: 3 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Patitas Felices', level: 3 })).toBeVisible();

    await expect(page.getByRole('button', { name: /Aprobar/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Rechazar/i }).first()).toBeVisible();
  });

  test('should approve a pending shelter and remove it from list', { tag: [...ADMIN_APPROVE_SHELTERS, '@outcome:success'] }, async ({ page }) => {
    let pendingList = [...mockPendingShelters];

    await page.route('**/api/admin/shelters/pending/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pendingList),
      }),
    );
    await page.route('**/api/admin/shelters/approve/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Shelter approved' }),
      }),
    );

    await loginAndNavigate(page, 'admin', '/admin/shelters/approve');

    await expect(page.getByRole('heading', { name: /Aprobar Refugios/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Refugio Nuevo', level: 3 })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /Aprobar/i }).first().click();
    pendingList = pendingList.filter(s => s.id !== 10);

    // Approved shelter should be removed from the list
    await expect(page.getByRole('heading', { name: 'Refugio Nuevo', level: 3 })).toBeHidden({ timeout: 10_000 });
    // Remaining shelter should still be visible
    await expect(page.getByRole('heading', { name: 'Patitas Felices', level: 3 })).toBeVisible();
  });

  test('should reject a pending shelter', { tag: [...ADMIN_APPROVE_SHELTERS, '@outcome:success'] }, async ({ page }) => {
    await page.route('**/api/admin/shelters/pending/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPendingShelters),
      }),
    );
    await page.route('**/api/admin/shelters/approve/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Shelter rejected' }),
      }),
    );

    await loginAndNavigate(page, 'admin', '/admin/shelters/approve');
    await expect(page.getByRole('heading', { name: 'Refugio Nuevo', level: 3 })).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /Rechazar/i }).first().click();

    // Rejected shelter should be removed from the list
    await expect(page.getByRole('heading', { name: 'Refugio Nuevo', level: 3 })).toBeHidden({ timeout: 10_000 });
  });

  test('should display empty state when no pending shelters', { tag: [...ADMIN_APPROVE_SHELTERS, '@outcome:display'] }, async ({ page }) => {
    await page.route('**/api/admin/shelters/pending/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    );

    await loginAndNavigate(page, 'admin', '/admin/shelters/approve');

    await expect(page.getByRole('heading', { name: /Aprobar Refugios/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/No hay refugios pendientes/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should display moderation page with animals and shelters', { tag: [...ADMIN_MODERATION, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (read-only moderation index: this spec asserts the pending animals and shelters are listed; approving and rejecting them are separate flows with their own specs, and loginAndNavigate seeds the session by cookie rather than filling a login form)
    await page.route('**/api/animals/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockModerationAnimals),
      }),
    );
    await page.route('**/api/shelters/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockModerationShelters),
      }),
    );

    await loginAndNavigate(page, 'admin', '/admin/moderation');

    await expect(page.getByRole('heading', { name: /Moderación/i })).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText(/Animales publicados recientes/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Luna').first()).toBeVisible();

    await expect(page.getByText(/Refugios registrados/i)).toBeVisible();
    await expect(page.getByText('Refugio Amor').first()).toBeVisible();
  });

  test('should display metrics page with dashboard cards', { tag: [...ADMIN_METRICS, '@outcome:display'] }, async ({ page }) => {
    // XHR/fetch to admin metrics only — do not match locale page URL /es/admin/metrics (same path segment)
    await page.route(
      (url) => {
        const p = url.pathname;
        const isApiPath = p.includes('/api/') && p.includes('admin/metrics');
        const isDirectBackend = (url.hostname === '127.0.0.1' || url.hostname === 'localhost') &&
          url.port === '8000' &&
          p.includes('admin/metrics');
        return isApiPath || isDirectBackend;
      },
      (route: any) => {
        if (route.request().method() !== 'GET') return route.continue();
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockMetrics),
        });
      },
    );

    // quality: allow-no-interaction (a metrics dashboard is read-only by nature: this spec waits for the real GET admin/metrics and asserts a formatted figure actually rendered, and there is nothing on the page to act on; loginAndNavigate seeds the session by cookie rather than filling a login form)
    const metricsResponse = page.waitForResponse(
      (r) => r.url().includes('admin/metrics') && r.request().method() === 'GET' && r.status() === 200,
      { timeout: 20_000 },
    );
    await loginAndNavigate(page, 'admin', '/admin/metrics');
    await metricsResponse;

    await expect(page.getByRole('heading', { name: /Métricas/i })).toBeVisible({ timeout: 15_000 });

    await expect(page.getByRole('main')).toContainText(/\$[\d.,]+|[\d.,]+%|\d+%/, { timeout: 20_000 });
  });

  const mockDashboard = {
    total_users: 128, total_shelters: 14, verified_shelters: 11, pending_shelters: 3,
    total_animals: 240, published_animals: 190, adopted_animals: 46,
    total_applications: 57, active_campaigns: 6, total_donations: 92, total_sponsorships: 18,
  };

  const routeDashboard = (page: any, status: number, body: unknown) =>
    page.route(
      (url: URL) => url.pathname.includes('admin/dashboard') && !url.pathname.startsWith('/es'),
      (route: any) => {
        if (route.request().method() !== 'GET') return route.continue();
        return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
      },
    );

  // Entered through the Admin panel menu: for a display flow reachability is part of
  // the behaviour. The figures asserted are the fixture's own, so a card wired to the
  // wrong field — or to a hard-coded number — fails instead of passing on layout.
  test('should display the dashboard cards with the platform totals', { tag: [...ADMIN_DASHBOARD, '@outcome:display'] }, async ({ page }) => {
    await routeDashboard(page, 200, mockDashboard);

    await loginAndNavigate(page, 'admin', '/');

    const adminPanel = page.getByRole('button', { name: 'Admin' });
    await expect(adminPanel).toBeVisible({ timeout: 15_000 });
    await adminPanel.click();
    await page.getByRole('menuitem', { name: /Dashboard/i }).click();
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15_000 });

    await expect(page.getByRole('heading', { name: /Panel de Administración/i })).toBeVisible({ timeout: 15_000 });

    const card = (label: string) => page.locator('div').filter({ hasText: new RegExp(`^${label}$`) }).locator('..');
    await expect(page.getByText('Usuarios', { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(card('Usuarios')).toContainText('128');
    await expect(card('Pendientes de aprobación')).toContainText('3');
    await expect(card('Adoptados')).toContainText('46');
  });

  // Fails if a dashboard outage renders as zeroes instead of as an outage. The page
  // swallows the request error (dashboard/page.tsx:38-40) and leaves `cards` empty, so
  // the labels must be ABSENT — an admin reading 0 users would conclude the platform
  // emptied out rather than that the endpoint is down.
  test('renders no cards at all when the dashboard API fails', { tag: [...ADMIN_DASHBOARD, '@outcome:failure'] }, async ({ page }) => {
    // quality: allow-no-interaction (failure render on load of a read-only panel —
    // the absent-cards state IS the behaviour, and there is nothing to click first)
    await routeDashboard(page, 500, {});

    await loginAndNavigate(page, 'admin', '/admin/dashboard');

    await expect(page.getByRole('heading', { name: /Panel de Administración/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Usuarios', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Donaciones pagadas', { exact: true })).not.toBeVisible();
    // The navigation tiles are static, so the page itself is still usable.
    await expect(page.getByText('Aprobar Refugios', { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  // Fails if a metrics outage renders as zeroes instead of as an outage. The page
  // swallows the request error (metrics/page.tsx:33-35) and only the null-metrics
  // branch distinguishes "nothing came back" from "everything is at 0" — an admin
  // reading 0 donations would think the platform stopped, not the endpoint.
  test('says the metrics could not be loaded when the API fails', { tag: [...ADMIN_METRICS, '@outcome:failure'] }, async ({ page }) => {
    // quality: allow-no-interaction (failure render on load, same read-only page as the
    // display spec above: there is nothing to click before the error state appears)
    await page.route(
      (url) => {
        const p = url.pathname;
        const isApiPath = p.includes('/api/') && p.includes('admin/metrics');
        const isDirectBackend = (url.hostname === '127.0.0.1' || url.hostname === 'localhost') &&
          url.port === '8000' &&
          p.includes('admin/metrics');
        return isApiPath || isDirectBackend;
      },
      (route: any) => {
        if (route.request().method() !== 'GET') return route.continue();
        return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({}) });
      },
    );

    await loginAndNavigate(page, 'admin', '/admin/metrics');

    // metrics.loadError, rendered by the null-metrics branch at metrics/page.tsx:87.
    await expect(page.getByText('No se pudieron cargar las métricas.')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('main')).not.toContainText(/\$[\d.,]+/);
  });

  test('should display payments audit table', { tag: [...ADMIN_PAYMENTS, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (read-only audit table: payments are recorded by the checkout flows and are not mutable from this view, so listing them is the whole behaviour; loginAndNavigate seeds the session by cookie rather than filling a login form)
    await page.route('**/payments/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPayments),
      }),
    );

    await loginAndNavigate(page, 'admin', '/admin/payments');

    await expect(page.getByRole('heading', { name: /Auditoría de Pagos/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/ref-abc-123/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/ref-def-456/i)).toBeVisible();
    await expect(page.getByText(/Aprobado/i).first()).toBeVisible();
    await expect(page.getByText(/Pendiente/i).first()).toBeVisible();
  });
});

test.describe('Admin Profile — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  const mockAdminProfile = {
    id: 1,
    email: 'admin-e2e@example.com',
    first_name: 'Admin',
    last_name: 'Plataforma',
    phone: '+57 301 000 0000',
    city: 'Bogotá',
    role: 'admin',
    is_staff: true,
    is_active: true,
    date_joined: '2025-01-01T00:00:00Z',
    admin_stats: { total_users: 42, total_shelters: 8, total_animals: 120, pending_verifications: 3 },
  };

  test('should display admin role section and NOT adopter cards', { tag: [...ADMIN_PROFILE, '@outcome:display'] }, async ({ page }) => {
    await page.route('**/user/profile/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAdminProfile) });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'admin', '/my-profile');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    const adminSection = page.getByText(/Responsabilidades de administrador/i);
    await expect(adminSection).toBeVisible({ timeout: 10_000 });

    await expect(page.getByRole('main').getByText(/Mis Solicitudes/i)).not.toBeVisible();
    await expect(page.getByRole('main').getByText(/Favoritos/i)).not.toBeVisible();
  });

  // Reached through the account menu rather than by deep link: for a display flow
  // getting there IS part of the behaviour, and a profile whose entry point vanished
  // from the header is broken even if /my-profile still renders. The count asserted
  // is the fixture's own pending_verifications (3), so a widget that hard-codes a
  // number or drops the binding fails instead of passing on layout alone.
  test('should display moderation-queue widget with pending count', { tag: [...ADMIN_PROFILE, '@outcome:display'] }, async ({ page }) => {
    await page.route('**/user/profile/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAdminProfile) });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'admin', '/');

    const accountButton = page.getByRole('button', { name: /Abrir menú de cuenta/i });
    await expect(accountButton).toBeVisible({ timeout: 15_000 });
    await accountButton.click();
    await page.getByRole('menuitem', { name: /Mi Perfil/i }).click();

    await expect(page).toHaveURL(/\/my-profile/, { timeout: 10_000 });
    await expect(page.getByText(/3 refugios por verificar/i)).toBeVisible({ timeout: 10_000 });
  });
});
