import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import { VET_FOLLOW_UPS_LIST, VET_FOLLOW_UP_DETAIL } from '../helpers/flow-tags';
import { mockFollowUps, mockFollowUpDetail } from '../helpers/mock-data';

test.describe('Veterinarian — Unauthenticated', () => {
  test('should redirect unauthenticated user from follow-ups list', { tag: [...VET_FOLLOW_UPS_LIST] }, async ({ page }) => {
    await page.goto('/veterinarian/follow-ups');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|veterinarian/);
  });

  test('should redirect unauthenticated user from follow-up detail', { tag: [...VET_FOLLOW_UP_DETAIL] }, async ({ page }) => {
    await page.goto('/veterinarian/follow-ups/1');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|veterinarian/);
  });
});

test.describe('Veterinarian — Follow-Ups List', () => {
  test('should show access denied for adopter role', { tag: [...VET_FOLLOW_UPS_LIST] }, async ({ page }) => {
    await loginAndNavigate(page, 'adopter', '/veterinarian/follow-ups');

    await expect(page.getByText(/Acceso denegado/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should display follow-ups list with animal cards for admin user', { tag: [...VET_FOLLOW_UPS_LIST] }, async ({ page }) => {
    await page.route('**/api/follow-ups/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUps) }),
    );

    await loginAndNavigate(page, 'admin', '/veterinarian/follow-ups');

    await expect(page.getByRole('heading', { name: /Seguimientos asignados/i, level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Luna')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Milo')).toBeVisible({ timeout: 10_000 });
  });

  test('should show empty state when no follow-ups are assigned', { tag: [...VET_FOLLOW_UPS_LIST] }, async ({ page }) => {
    await page.route('**/api/follow-ups/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await loginAndNavigate(page, 'admin', '/veterinarian/follow-ups');

    await expect(page.getByText(/No tienes seguimientos asignados/i)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Veterinarian — Follow-Up Detail', () => {
  test('should display follow-up detail with animal name and clinical history', { tag: [...VET_FOLLOW_UP_DETAIL] }, async ({ page }) => {
    await page.route('**/api/follow-ups/1/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUpDetail) }),
    );

    await loginAndNavigate(page, 'admin', '/veterinarian/follow-ups/1');

    await expect(page.getByRole('heading', { name: 'Luna', level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /Historia clínica/i, level: 2 })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Primera revisión')).toBeVisible({ timeout: 10_000 });
  });

  test('should show mark-complete button when follow-up status is pending', { tag: [...VET_FOLLOW_UP_DETAIL] }, async ({ page }) => {
    await page.route('**/api/follow-ups/1/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockFollowUpDetail) }),
    );

    await loginAndNavigate(page, 'admin', '/veterinarian/follow-ups/1');

    await expect(page.getByRole('button', { name: /Marcar como completado/i })).toBeVisible({ timeout: 15_000 });
  });
});
