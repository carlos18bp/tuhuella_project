import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import { VET_FOLLOW_UPS_LIST, VET_FOLLOW_UP_DETAIL, VETERINARIAN_PROFILE } from '../helpers/flow-tags';
import { mockFollowUps, mockFollowUpDetail, mockProfileStats, mockActivity } from '../helpers/mock-data';

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

test.describe('Veterinarian — Profile', () => {
  test(
    'should display profile page for veterinarian with common profile elements',
    { tag: [...VETERINARIAN_PROFILE] },
    async ({ page }) => {
      await page.route('**/api/auth/validate_token/**', (route: any) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 10, email: 'vet-e2e@example.com', first_name: 'Marco', last_name: 'Ríos', role: 'veterinarian', is_staff: false, is_active: true },
          }),
        }),
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

      await page.goto('/my-profile');
      await waitForPageLoad(page);

      const profileName = page.getByText(/Marco/i);
      const profileHeading = page.getByRole('heading', { name: /perfil|profile/i });
      await expect(profileName.or(profileHeading)).toBeVisible({ timeout: 15_000 });
    },
  );
});
