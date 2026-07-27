import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  WEB_MANAGER_CAMPAIGNS,
  WEB_MANAGER_CAMPAIGN_DETAIL,
  WEB_MANAGER_CAMPAIGN_CREATE,
  WEB_MANAGER_SHELTERS,
  WEB_MANAGER_SHELTER_DETAIL,
  WEB_MANAGER_APPLICATIONS,
  WEB_MANAGER_PROFILE,
  WEB_MANAGER_CAMPAIGN_MESSAGES,
  ADOPTION_DETAIL_WEB_MANAGER,
  ADOPTION_EVENT_CREATE_WEB_MANAGER,
} from '../helpers/flow-tags';
import {
  mockAdminCampaigns,
  mockCampaignDetail,
  mockShelterData,
  mockCampaignMessages,
  mockAdminApplications,
  mockProfileStats,
  mockActivity,
} from '../helpers/mock-data';

test.describe('Web Manager — Unauthenticated (Shelters & Applications)', () => {
  test('should redirect unauthenticated user from shelters list', { tag: [...WEB_MANAGER_SHELTERS] }, async ({ page }) => {
    await page.goto('/web-manager/shelters');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from shelter detail', { tag: [...WEB_MANAGER_SHELTER_DETAIL] }, async ({ page }) => {
    await page.goto('/web-manager/shelters/1');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from applications board', { tag: [...WEB_MANAGER_APPLICATIONS] }, async ({ page }) => {
    await page.goto('/web-manager/applications');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Web Manager — Shelters List', () => {
  test('should display shelters list with verification filter chips', { tag: [...WEB_MANAGER_SHELTERS, '@outcome:display'] }, async ({ page }) => {
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
  test('should display shelter detail with info and applications tabs', { tag: [...WEB_MANAGER_SHELTER_DETAIL, '@outcome:display'] }, async ({ page }) => {
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
    await expect(page.getByRole('tab', { name: /Solicitudes/i })).toBeVisible({ timeout: 10_000 });
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

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from campaign detail', { tag: [...WEB_MANAGER_CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.goto('/web-manager/campaigns/3');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from campaign create', { tag: [...WEB_MANAGER_CAMPAIGN_CREATE] }, async ({ page }) => {
    await page.goto('/web-manager/campaigns/new');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
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

  test('should navigate to create campaign page from list', { tag: [...WEB_MANAGER_CAMPAIGNS, '@outcome:success'] }, async ({ page }) => {
    await page.route('**/api/admin/campaigns/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAdminCampaigns) }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/campaigns');
    await page.getByRole('link', { name: /Nueva campaña/i }).click({ timeout: 10_000 });

    await expect(page).toHaveURL(/campaigns\/new/);
  });
});

test.describe('Web Manager — Campaign Detail', () => {
  test('should display campaign detail with approve and reject buttons', { tag: [...WEB_MANAGER_CAMPAIGN_DETAIL, '@outcome:display'] }, async ({ page }) => {
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

  test('should expand rejection textarea when reject button is clicked', { tag: [...WEB_MANAGER_CAMPAIGN_DETAIL, '@outcome:success'] }, async ({ page }) => {
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

test.describe('Web Manager — Profile', () => {
  test(
    'should display profile page for web_manager with common profile elements',
    { tag: [...WEB_MANAGER_PROFILE] },
    async ({ page }) => {
      await page.route('**/user/profile-stats/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
      );
      await page.route('**/user/activity/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockActivity) }),
      );

      await loginAndNavigate(page, 'web_manager', '/my-profile');

      const profileName = page.getByText(/Laura/i);
      const profileHeading = page.getByRole('heading', { name: /perfil|profile/i });
      await expect(profileName.or(profileHeading)).toBeVisible({ timeout: 15_000 });
    },
  );

  test(
    'should display WebManagerProfileSection with stat labels and quick actions',
    { tag: [...WEB_MANAGER_PROFILE] },
    async ({ page }) => {
      await page.route('**/api/admin/shelters/all/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 3 }) }),
      );
      await page.route('**/api/admin/applications/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 5 }) }),
      );
      await page.route('**/api/admin/campaigns/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 2 }) }),
      );
      await page.route('**/user/profile-stats/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
      );
      await page.route('**/user/activity/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockActivity) }),
      );

      await loginAndNavigate(page, 'web_manager', '/my-profile');

      await expect(page.getByText(/Responsabilidades del web manager/i)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/Resumen del web manager/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/Refugios por verificar/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/Solicitudes nuevas/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/Campañas por revisar/i)).toBeVisible({ timeout: 10_000 });
    },
  );

  test(
    'should render quick action links in WebManagerProfileSection',
    { tag: [...WEB_MANAGER_PROFILE] },
    async ({ page }) => {
      await page.route('**/api/admin/shelters/all/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 0 }) }),
      );
      await page.route('**/api/admin/applications/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 0 }) }),
      );
      await page.route('**/api/admin/campaigns/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 0 }) }),
      );
      await page.route('**/user/profile-stats/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfileStats) }),
      );
      await page.route('**/user/activity/**', (route: any) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockActivity) }),
      );

      await loginAndNavigate(page, 'web_manager', '/my-profile');

      await expect(page.getByRole('link', { name: /Nueva campaña/i })).toBeVisible({ timeout: 15_000 });
    },
  );
});

test.describe('Web Manager Campaign Messages', () => {
  test(
    'web manager reads and sends a campaign approval message',
    { tag: [...WEB_MANAGER_CAMPAIGN_MESSAGES, '@outcome:display', '@outcome:success'] },
    async ({ page }) => {
      let sentBody: string | null = null;

      await page.route('**/api/campaigns/3/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignDetail) }),
      );
      // Registered after the general campaign route so it wins for the messages path.
      await page.route('**/api/campaigns/3/messages/**', (route) => {
        if (route.request().method() === 'POST') {
          sentBody = (route.request().postDataJSON() as { body?: string })?.body ?? null;
          return route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 99, campaign: 3, author: 5, author_name: 'Laura Gómez',
              author_role: 'web_manager', body: sentBody ?? '', is_system: false,
              created_at: '2026-05-04T10:00:00Z',
            }),
          });
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignMessages) });
      });

      await loginAndNavigate(page, 'web_manager', '/web-manager/campaigns/3');

      await expect(page.getByText(/Conversación/i)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('Falta imagen de portada para la campaña.')).toBeVisible({ timeout: 10_000 });

      const composer = page.getByPlaceholder(/Escribe un mensaje/i);
      await composer.fill('Falta corregir la portada antes de aprobar.');
      await page.getByRole('button', { name: 'Enviar' }).click();

      await expect.poll(() => sentBody, { timeout: 5_000 }).toContain('Falta corregir la portada');
      await expect(page.getByText('Falta corregir la portada antes de aprobar.')).toBeVisible({ timeout: 10_000 });
    },
  );
});

const baseWmApplication = {
  id: 1,
  animal: 10,
  animal_name: 'Luna',
  animal_species: 'dog',
  shelter_name: 'Refugio E2E',
  shelter_city: 'Bogotá',
  thumbnail_url: null,
  user: 2,
  user_email: 'adopter-e2e@example.com',
  status: 'interview',
  form_answers: { reason: 'Love animals' },
  notes: '',
  reviewed_at: null,
  next_follow_up_due_at: '2026-07-12T12:00:00Z',
  shelter_whatsapp: '+57 300 111 2233',
  applicant_whatsapp: '+57 311 222 3344',
  events: [],
  created_at: '2026-04-20T12:00:00Z',
};

test.describe('Web Manager Application Detail', () => {
  test(
    'web manager views an application detail with applicant and status',
    { tag: [...ADOPTION_DETAIL_WEB_MANAGER] },
    async ({ page }) => {
      await page.route('**/api/adoptions/1/**', (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(baseWmApplication) });
        }
        return route.fallback();
      });

      await loginAndNavigate(page, 'web_manager', '/web-manager/applications/1');

      await expect(page.getByRole('heading', { level: 1, name: 'Luna' })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/Solicitante/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('adopter-e2e@example.com')).toBeVisible();
    },
  );

  test(
    'web manager records a follow-up event on an application',
    { tag: [...ADOPTION_EVENT_CREATE_WEB_MANAGER] },
    async ({ page }) => {
      let postBody: { event_date?: string; description?: string } | null = null;

      await page.route('**/api/adoptions/1/', (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(baseWmApplication) });
        }
        return route.fallback();
      });
      await page.route('**/api/adoptions/1/events/', (route) => {
        if (route.request().method() === 'POST') {
          postBody = route.request().postDataJSON();
          return route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 55,
              application: 1,
              event_date: postBody?.event_date ?? '2026-05-04T10:00:00Z',
              description: postBody?.description ?? '',
              created_by: 5,
              created_by_name: 'Laura Gómez',
              created_by_role: 'web_manager',
              created_by_email: 'webmanager-e2e@example.com',
              created_at: '2026-05-04T10:00:00Z',
            }),
          });
        }
        return route.fallback();
      });

      await loginAndNavigate(page, 'web_manager', '/web-manager/applications/1');

      await expect(page.getByRole('heading', { level: 1, name: 'Luna' })).toBeVisible({ timeout: 15_000 });

      const addEventButton = page.getByTestId('event-add-button');
      await expect(addEventButton).toBeVisible({ timeout: 10_000 });
      await addEventButton.click();

      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByTestId('event-description-input').fill('Entrevista telefónica coordinada con el adoptante.');
      await page.getByTestId('event-submit').click();

      await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10_000 });
      await expect.poll(() => postBody?.description ?? null, { timeout: 5_000 }).toContain('Entrevista telefónica');
      await expect.poll(() => postBody?.event_date ?? null).not.toBeNull();
    },
  );
});
