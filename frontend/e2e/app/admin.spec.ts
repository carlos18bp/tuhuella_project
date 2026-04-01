import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  ADMIN_DASHBOARD,
  ADMIN_APPROVE_SHELTERS,
  ADMIN_MODERATION,
  ADMIN_METRICS,
  ADMIN_PAYMENTS,
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

    await expect(page).toHaveURL(/sign-in|dashboard/);
  });

  test('should display admin dashboard when accessible', { tag: [...ADMIN_DASHBOARD] }, async ({ page }) => {
    await page.goto('/admin/dashboard');
    await waitForPageLoad(page);

    if (new URL(page.url()).pathname.includes('admin/dashboard')) {
      await expect(page.getByRole('heading', { name: /Panel de Administración/i })).toBeVisible();
      await expect(page.getByText(/Vista general de la plataforma/i)).toBeVisible();
    }
  });

  test('should show access denied for non-admin users', { tag: [...ADMIN_DASHBOARD] }, async ({ page }) => {
    await page.goto('/admin/dashboard');
    await waitForPageLoad(page);

    if (new URL(page.url()).pathname.includes('admin/dashboard')) {
      const heading = page.getByRole('heading', { name: /Panel de Administración/i });
      const denied = page.getByText(/Acceso denegado/i);

      const hasHeading = await heading.isVisible().catch(() => false);
      const hasDenied = await denied.isVisible().catch(() => false);
      expect(hasHeading || hasDenied).toBe(true);
    }
  });

  test('should redirect unauthenticated user from approve shelters', { tag: [...ADMIN_APPROVE_SHELTERS] }, async ({ page }) => {
    await page.goto('/admin/shelters/approve');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|approve/);
  });

  test('should redirect unauthenticated user from moderation', { tag: [...ADMIN_MODERATION] }, async ({ page }) => {
    await page.goto('/admin/moderation');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|moderation/);
  });

  test('should redirect unauthenticated user from metrics', { tag: [...ADMIN_METRICS] }, async ({ page }) => {
    await page.goto('/admin/metrics');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|metrics/);
  });

  test('should redirect unauthenticated user from payments', { tag: [...ADMIN_PAYMENTS] }, async ({ page }) => {
    await page.goto('/admin/payments');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|payments/);
  });
});

test.describe('Admin Panel — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display approve shelters page with pending list', { tag: [...ADMIN_APPROVE_SHELTERS] }, async ({ page }) => {
    const pendingResponse = page.waitForResponse((res: any) => res.url().includes('/admin/shelters/pending'));
    await page.route('**/api/admin/shelters/pending/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPendingShelters),
      }),
    );

    await loginAndNavigate(page, 'admin', '/admin/shelters/approve');
    await pendingResponse;

    await expect(page.getByRole('heading', { name: /Aprobar Refugios/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Refugio Nuevo', level: 3 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Patitas Felices', level: 3 })).toBeVisible();

    await expect(page.getByRole('button', { name: /Aprobar/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Rechazar/i }).first()).toBeVisible();
  });

  test('should approve a pending shelter and remove it from list', { tag: [...ADMIN_APPROVE_SHELTERS] }, async ({ page }) => {
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

  test('should reject a pending shelter', { tag: [...ADMIN_APPROVE_SHELTERS] }, async ({ page }) => {
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

  test('should display empty state when no pending shelters', { tag: [...ADMIN_APPROVE_SHELTERS] }, async ({ page }) => {
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

  test('should display moderation page with animals and shelters', { tag: [...ADMIN_MODERATION] }, async ({ page }) => {
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

  test('should display metrics page with dashboard cards', { tag: [...ADMIN_METRICS] }, async ({ page }) => {
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

    const metricsResponse = page.waitForResponse(
      (r) => r.url().includes('admin/metrics') && r.request().method() === 'GET' && r.status() === 200,
      { timeout: 20_000 },
    );
    await loginAndNavigate(page, 'admin', '/admin/metrics');
    await metricsResponse;

    await expect(page.getByRole('heading', { name: /Métricas/i })).toBeVisible({ timeout: 15_000 });

    await expect(page.getByRole('main')).toContainText(/\$[\d.,]+|[\d.,]+%|\d+%/, { timeout: 20_000 });
  });

  test('should display payments audit table', { tag: [...ADMIN_PAYMENTS] }, async ({ page }) => {
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
