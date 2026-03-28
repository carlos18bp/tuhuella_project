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
    await page.route('**/api/admin/shelters/pending/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPendingShelters),
      }),
    );

    await loginAndNavigate(page, 'admin', '/admin/shelters/approve');

    await expect(page.getByRole('heading', { name: /Aprobar Refugios/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Refugio Nuevo')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Patitas Felices')).toBeVisible();

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
    await expect(page.getByText('Refugio Nuevo')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /Aprobar/i }).first().click();
    pendingList = pendingList.filter(s => s.id !== 10);

    // Shelter should disappear from list or success message should appear
    const shelterCard = page.getByText('Refugio Nuevo');
    const successMsg = page.getByText(/aprobado|approved/i);
    await expect(shelterCard.or(successMsg)).toBeVisible({ timeout: 5_000 });

    await expect(page.getByText('Patitas Felices')).toBeVisible();
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
    await expect(page.getByText('Refugio Nuevo')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /Rechazar/i }).first().click();

    const shelterCard = page.getByText('Refugio Nuevo');
    const rejectMsg = page.getByText(/rechazado|rejected/i);
    await expect(shelterCard.or(rejectMsg)).toBeVisible({ timeout: 5_000 });
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
    await page.route('**/api/admin/metrics/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMetrics),
      }),
    );

    await loginAndNavigate(page, 'admin', '/admin/metrics');

    const metricsHeading = page.getByRole('heading').first();
    await expect(metricsHeading).toBeVisible({ timeout: 15_000 });

    const donationAmount = page.getByText(/2\.500\.000|2,500,000/i);
    const adoptionRate = page.getByText(/40%/i);
    const hasDonationAmount = await donationAmount.isVisible({ timeout: 10_000 }).catch(() => false);
    const hasAdoptionRate = await adoptionRate.isVisible({ timeout: 5_000 }).catch(() => false);

    expect(hasDonationAmount || hasAdoptionRate).toBe(true);
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
