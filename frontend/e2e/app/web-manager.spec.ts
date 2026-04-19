import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  WEB_MANAGER_CAMPAIGNS,
  WEB_MANAGER_CAMPAIGN_DETAIL,
  WEB_MANAGER_CAMPAIGN_CREATE,
  WEB_MANAGER_SHELTERS,
  WEB_MANAGER_SHELTER_DETAIL,
  WEB_MANAGER_APPLICATIONS,
} from '../helpers/flow-tags';
import {
  mockAdminCampaigns,
  mockCampaignDetail,
  mockShelterData,
  mockCampaignMessages,
  mockAdminApplications,
} from '../helpers/mock-data';

test.describe('Web Manager — Unauthenticated (Shelters & Applications)', () => {
  test('should redirect unauthenticated user from shelters list', { tag: [...WEB_MANAGER_SHELTERS] }, async ({ page }) => {
    await page.goto('/web-manager/shelters');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|web-manager/);
  });

  test('should redirect unauthenticated user from shelter detail', { tag: [...WEB_MANAGER_SHELTER_DETAIL] }, async ({ page }) => {
    await page.goto('/web-manager/shelters/1');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|web-manager/);
  });

  test('should redirect unauthenticated user from applications board', { tag: [...WEB_MANAGER_APPLICATIONS] }, async ({ page }) => {
    await page.goto('/web-manager/applications');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|web-manager/);
  });
});

test.describe('Web Manager — Shelters List', () => {
  test('should display shelters list with verification filter chips', { tag: [...WEB_MANAGER_SHELTERS] }, async ({ page }) => {
    await page.route('**/api/admin/shelters/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 1, page: 1, total_pages: 1, results: mockShelterData }),
      }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/shelters');

    await expect(page.getByRole('heading', { name: /Refugios/i, level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Refugio E2E')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Todas/i })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Web Manager — Shelter Detail', () => {
  test('should display shelter detail with info and applications tabs', { tag: [...WEB_MANAGER_SHELTER_DETAIL] }, async ({ page }) => {
    await page.route('**/api/admin/shelters/1/applications/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAdminApplications),
      }),
    );
    await page.route('**/api/admin/shelters/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 1, page: 1, total_pages: 1, results: mockShelterData }),
      }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/shelters/1');

    await expect(page.getByText('Refugio E2E')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Solicitudes/i })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Web Manager — Applications Board', () => {
  test('should display global applications board with status filter chips', { tag: [...WEB_MANAGER_APPLICATIONS] }, async ({ page }) => {
    await page.route('**/api/admin/applications/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAdminApplications),
      }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/applications');

    await expect(page.getByRole('heading', { name: /Solicitudes de adopción/i, level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Luna')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('adopter-e2e@example.com')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Web Manager — Unauthenticated', () => {
  test('should redirect unauthenticated user from campaigns list', { tag: [...WEB_MANAGER_CAMPAIGNS] }, async ({ page }) => {
    await page.goto('/web-manager/campaigns');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|web-manager/);
  });

  test('should redirect unauthenticated user from campaign detail', { tag: [...WEB_MANAGER_CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.goto('/web-manager/campaigns/3');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|web-manager/);
  });

  test('should redirect unauthenticated user from campaign create', { tag: [...WEB_MANAGER_CAMPAIGN_CREATE] }, async ({ page }) => {
    await page.goto('/web-manager/campaigns/new');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|web-manager/);
  });
});

test.describe('Web Manager — Campaign List', () => {
  test('should display pending campaigns list with filter tabs', { tag: [...WEB_MANAGER_CAMPAIGNS] }, async ({ page }) => {
    await page.route('**/api/admin/campaigns/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAdminCampaigns) }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/campaigns');

    await expect(page.getByText(/Esterilización urgente/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Rescate de temporada/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Pendientes/i })).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate to create campaign page from list', { tag: [...WEB_MANAGER_CAMPAIGNS] }, async ({ page }) => {
    await page.route('**/api/admin/campaigns/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAdminCampaigns) }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/campaigns');
    await page.getByRole('link', { name: /Nueva campaña/i }).click({ timeout: 10_000 });

    await expect(page).toHaveURL(/campaigns\/new/);
  });
});

test.describe('Web Manager — Campaign Detail', () => {
  test('should display campaign detail with approve and reject buttons', { tag: [...WEB_MANAGER_CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.route('**/api/campaigns/3/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignDetail) }),
    );
    await page.route('**/api/campaigns/3/messages/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignMessages) }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/campaigns/3');

    await expect(page.getByText(/Esterilización urgente/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Aprobar/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Rechazar/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Conversación/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should expand rejection textarea when reject button is clicked', { tag: [...WEB_MANAGER_CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.route('**/api/campaigns/3/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignDetail) }),
    );
    await page.route('**/api/campaigns/3/messages/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignMessages) }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/campaigns/3');
    await page.getByRole('button', { name: /Rechazar/i }).click({ timeout: 10_000 });

    await expect(page.getByPlaceholder(/Explica qué falta/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('button', { name: /Confirmar rechazo/i })).toBeDisabled();
  });
});

test.describe('Web Manager — Campaign Create', () => {
  test('should display campaign creation form with shelter selector', { tag: [...WEB_MANAGER_CAMPAIGN_CREATE] }, async ({ page }) => {
    await page.route('**/api/admin/shelters/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 1, page: 1, total_pages: 1, results: mockShelterData }),
      }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/campaigns/new');

    await expect(page.getByRole('heading', { name: /Nueva campaña/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('combobox')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Crear campaña/i })).toBeVisible({ timeout: 10_000 });
  });
});
