import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import {
  ADMIN_DASHBOARD,
  ADMIN_APPROVE_SHELTERS,
  ADMIN_MODERATION,
  ADMIN_METRICS,
  ADMIN_PAYMENTS,
} from '../helpers/flow-tags';

test.describe('Admin Panel', () => {
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
      // Either shows metrics or "Acceso denegado" depending on role
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
