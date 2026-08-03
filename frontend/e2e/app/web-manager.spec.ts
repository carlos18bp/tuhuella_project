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
import { paceRequestsUnderRateLimit } from '../helpers/pacing';

const jsonOk = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

const sheltersPage = (results: unknown[]) => ({
  count: results.length,
  page: 1,
  total_pages: 1,
  results,
});

test.describe('Web Manager — Unauthenticated (Shelters & Applications)', () => {
  // First line of the beforeEach, per the helper's ordering contract: every mock a
  // test registers in its own body lands AFTER this catch-all and therefore wins.
  test.beforeEach(async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
  });

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
  // Reached through the "Gestión Web" panel instead of a deep link: for a display
  // flow the reachability IS the behavior under test. A deep link would still pass
  // if Header.tsx:749 stopped routing the panel item to the shelters list.
  test('should display shelters list with verification filter chips', { tag: [...WEB_MANAGER_SHELTERS, '@outcome:display'] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/admin/shelters/**', (route: any) =>
      route.fulfill(jsonOk(sheltersPage(mockShelterData))),
    );

    await loginAndNavigate(page, 'web_manager', '/');
    await page.getByRole('button', { name: 'Gestión Web' }).click({ timeout: 15_000 });
    // `nav.sheltersManage` and `nav.shelters` are BOTH the plain noun "Refugios"
    // (messages/es.json). The public header link is a bare <Link>; only the panel
    // items carry role="menuitem" (Header.tsx:711), which is what disambiguates.
    await page.getByRole('menuitem', { name: 'Refugios', exact: true }).click({ timeout: 10_000 });

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Refugios', { timeout: 15_000 });
    await expect(page.getByText('Refugio E2E')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Todas', exact: true })).toBeVisible({ timeout: 10_000 });
  });

  // Catches: the "Pendientes" chip highlighting without threading its key into the
  // query. shelters/page.tsx:42 sets the filter, :26-28 refetches on it, and
  // webManagerStore.ts:80-84 appends buildParams — break any link in that chain and
  // the operator stares at the unfiltered list while the chip looks selected, which
  // no visibility assertion can catch.
  test('should refetch shelters with verification_status when the Pendientes chip is clicked', { tag: [...WEB_MANAGER_SHELTERS, '@outcome:success'] }, async ({ page }) => {
    const requestedUrls: string[] = [];

    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/admin/shelters/all/**', (route: any) => {
      const url = route.request().url();
      requestedUrls.push(url);
      // The server-side filter, faithfully simulated: only a request that actually
      // carries the param gets the pending row back.
      const pendingOnly = url.includes('verification_status=pending');
      return route.fulfill(
        jsonOk(
          sheltersPage(
            pendingOnly
              ? [{ ...mockShelterData[0], id: 2, name: 'Refugio Pendiente', verification_status: 'pending' }]
              : mockShelterData,
          ),
        ),
      );
    });

    await loginAndNavigate(page, 'web_manager', '/web-manager/shelters');
    await expect(page.getByText('Refugio E2E')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Pendientes', exact: true }).click({ timeout: 10_000 });

    // buildParams (webManagerStore.ts:58-66) DROPS empty strings, so the 'Todas'
    // chip legitimately produces no param — 'Pendientes' is the only chip whose
    // key must survive the round trip.
    await expect
      .poll(() => requestedUrls.at(-1) ?? '', { timeout: 10_000 })
      .toContain('verification_status=pending');
    await expect(page.getByRole('link', { name: /Refugio Pendiente/ })).toHaveAttribute(
      'href',
      '/es/web-manager/shelters/2',
    );
  });
});

test.describe('Web Manager — Shelter Detail', () => {
  /**
   * Route ORDER is load-bearing here and was previously inverted. Playwright matches
   * handlers in REVERSE registration order, so the broad `**\/api/admin/shelters/**`
   * has to be registered FIRST and the narrow `/1/applications/` one AFTER it —
   * otherwise the broad handler answers the applications request with the shelters
   * page payload and the table renders rows built from the wrong resource.
   */
  const mockShelterDetailApi = async (page: any) => {
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/admin/shelters/**', (route: any) =>
      route.fulfill(jsonOk(sheltersPage(mockShelterData))),
    );
    await page.route('**/api/admin/shelters/1/applications/**', (route: any) =>
      route.fulfill(jsonOk(mockAdminApplications)),
    );
  };

  // Arrives by clicking the row on the list rather than deep-linking, so a wrong
  // detail href built at shelters/page.tsx:68-69 fails the test instead of being
  // bypassed. The detail page resolves its shelter from the already-loaded store
  // list ([id]/page.tsx:38-41), which is exactly the realistic path.
  test('should display shelter detail with info and applications tabs', { tag: [...WEB_MANAGER_SHELTER_DETAIL, '@outcome:display'] }, async ({ page }) => {
    await mockShelterDetailApi(page);

    await loginAndNavigate(page, 'web_manager', '/web-manager/shelters');
    await page.getByRole('link', { name: /Refugio E2E/ }).click({ timeout: 15_000 });

    await expect(page).toHaveURL(/\/web-manager\/shelters\/\d+$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Refugio E2E', { timeout: 15_000 });
    await expect(page.getByRole('tab', { name: 'Solicitudes' })).toBeVisible({ timeout: 10_000 });
  });

  // Catches: setTab not switching the panel. The tab defaults to 'applications'
  // ([id]/page.tsx:26) and the two panels are mutually exclusive (:91-110 / :112-114),
  // so if the click stops flipping the state the operator can never reach the
  // shelter's contact data — while both tabs still render and look fine.
  test('should switch to the info tab and show the shelter owner email', { tag: [...WEB_MANAGER_SHELTER_DETAIL, '@outcome:success'] }, async ({ page }) => {
    await mockShelterDetailApi(page);

    await loginAndNavigate(page, 'web_manager', '/web-manager/shelters/1');
    const infoTab = page.getByRole('tab', { name: 'Información' });
    await expect(infoTab).toHaveAttribute('aria-selected', 'false', { timeout: 15_000 });

    await infoTab.click({ timeout: 10_000 });

    await expect(infoTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: 'Solicitudes' })).toHaveAttribute('aria-selected', 'false');
    // The dl falls back to '—' when owner_email is missing ([id]/page.tsx:96), so
    // this asserts the fixture's real value — never the fallback.
    await expect(page.getByText('owner-e2e@example.com')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Web Manager — Applications Board', () => {
  // Was UNTAGGED, which credited `success` on a flow declaring ["display","success"]
  // — the stray-evidence case flow_coverage_audit.py:206-215 warns about. Now tagged
  // display and entered through the panel, so the route itself is under test.
  test('should display global applications board with status filter chips', { tag: [...WEB_MANAGER_APPLICATIONS, '@outcome:display'] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/admin/applications/**', (route: any) =>
      route.fulfill(jsonOk(mockAdminApplications)),
    );

    await loginAndNavigate(page, 'web_manager', '/');
    await page.getByRole('button', { name: 'Gestión Web' }).click({ timeout: 15_000 });
    await page.getByRole('menuitem', { name: 'Solicitudes', exact: true }).click({ timeout: 10_000 });

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Solicitudes de adopción', { timeout: 15_000 });
    await expect(page.getByText('Luna')).toBeVisible({ timeout: 10_000 });
    // The applicant column (AdminApplicationsTable.tsx:64) is what makes the board
    // usable; a row rendered without it is a silently broken board.
    await expect(page.getByText('adopter-e2e@example.com')).toBeVisible({ timeout: 10_000 });
  });

  // Same class of bug as the shelters chip, on the applications board:
  // applications/page.tsx:54 sets the filter, :27-29 refetches, and
  // webManagerStore.ts:101-105 builds the URL.
  test('should refetch applications with status when the Entrevista chip is clicked', { tag: [...WEB_MANAGER_APPLICATIONS, '@outcome:success'] }, async ({ page }) => {
    const requestedUrls: string[] = [];

    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/admin/applications/**', (route: any) => {
      const url = route.request().url();
      requestedUrls.push(url);
      const interviewOnly = url.includes('status=interview');
      return route.fulfill(
        jsonOk(
          interviewOnly
            ? {
                count: 1,
                page: 1,
                total_pages: 1,
                results: [
                  {
                    ...mockAdminApplications.results[0],
                    id: 7,
                    animal_name: 'Nala',
                    user_email: 'interview-e2e@example.com',
                    status: 'interview',
                  },
                ],
              }
            : mockAdminApplications,
        ),
      );
    });

    await loginAndNavigate(page, 'web_manager', '/web-manager/applications');
    // Header row + the two unfiltered rows.
    await expect(page.getByRole('row')).toHaveCount(3, { timeout: 15_000 });

    // The board's 'Todas' chip is a separate button (applications/page.tsx:39-49)
    // and also produces no param, so 'Entrevista' is the meaningful assertion.
    await page.getByRole('button', { name: 'Entrevista', exact: true }).click({ timeout: 10_000 });

    await expect.poll(() => requestedUrls.at(-1) ?? '', { timeout: 10_000 }).toContain('status=interview');
    await expect(page.getByRole('row')).toHaveCount(2);
    await expect(page.getByRole('cell', { name: 'interview-e2e@example.com' })).toBeVisible();
  });
});

test.describe('Web Manager — Unauthenticated', () => {
  test.beforeEach(async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
  });

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
  test.beforeEach(async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
  });

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
  test.beforeEach(async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
  });

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
    await paceRequestsUnderRateLimit(page);
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

  /**
   * NOTE for anyone extending this suite: the client-side validation copy at
   * campaigns/new/page.tsx:32-34 ("Refugio, título y meta son requeridos.") is
   * UNREACHABLE from a browser — the select (:72), the ES title (:88) and the goal
   * (:131) all carry native `required`, so the browser blocks submit before onSubmit
   * runs. "Submit empty, assert the client copy" can never pass; the error class has
   * to come from the server, which is what the 400 test below does.
   */
  const mockCampaignCreateApi = async (
    page: any,
    onCreate: (route: any) => unknown,
  ) => {
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/admin/shelters/**', (route: any) =>
      route.fulfill(jsonOk(sheltersPage(mockShelterData))),
    );
    await page.route('**/api/campaigns/**', (route: any) => {
      if (route.request().method() === 'POST') return onCreate(route);
      return route.fulfill(jsonOk({ ...mockCampaignDetail, id: 77 }));
    });
    // Registered last so it wins for the detail page's messages call (reverse-order
    // matching); the POST to /campaigns/create/ does not match this pattern.
    await page.route('**/api/campaigns/*/messages/**', (route: any) =>
      route.fulfill(jsonOk(mockCampaignMessages)),
    );
  };

  // Catches: the form assembling the wrong payload or swallowing the redirect.
  // campaigns/new/page.tsx:38-47 maps four separate pieces of form state into the
  // create call and then routes to the new campaign's id — a mis-mapped field (the
  // shelter sent as a string, the goal dropped, `status` omitted) still renders a
  // perfectly happy form, so the intercepted body is the only real check.
  test('web manager creates a campaign and is routed to the new campaign detail', { tag: [...WEB_MANAGER_CAMPAIGN_CREATE, '@outcome:success'] }, async ({ page }) => {
    const createBodies: Record<string, unknown>[] = [];

    await mockCampaignCreateApi(page, (route: any) => {
      createBodies.push(route.request().postDataJSON());
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockCampaignDetail, id: 77, title_es: 'Jornada de esterilización' }),
      });
    });

    await loginAndNavigate(page, 'web_manager', '/web-manager/campaigns/new');

    await page.getByRole('combobox').selectOption({ label: 'Refugio E2E' });
    await page.getByLabel('Título (ES)').fill('Jornada de esterilización');
    await page.getByLabel('Meta (COP)').fill('750000');
    await page.getByRole('button', { name: 'Crear campaña' }).click();

    await expect.poll(() => createBodies.at(-1) ?? null, { timeout: 15_000 }).toMatchObject({
      shelter: 1,
      title_es: 'Jornada de esterilización',
      goal_amount: '750000',
      status: 'draft',
    });
    await expect(page).toHaveURL(/\/web-manager\/campaigns\/77$/);
  });

  // Catches: the server rejection never reaching the screen. createCampaign has no
  // try/catch (campaignStore.ts:85-91), so the raw Axios message is what
  // new/page.tsx:49 stores and :135 renders. Asserting the exact string pins the
  // status digit — the only thing distinguishing a 4xx from a 5xx here — and would
  // fail the moment the rejection is swallowed and the operator is left thinking
  // the campaign was created.
  test('web manager sees the server rejection when campaign creation returns 400', { tag: [...WEB_MANAGER_CAMPAIGN_CREATE, '@outcome:error'] }, async ({ page }) => {
    await mockCampaignCreateApi(page, (route: any) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ goal_amount: ['La meta debe ser mayor que cero.'] }),
      }),
    );

    await loginAndNavigate(page, 'web_manager', '/web-manager/campaigns/new');

    await page.getByRole('combobox').selectOption({ label: 'Refugio E2E' });
    await page.getByLabel('Título (ES)').fill('Campaña rechazada por el servidor');
    await page.getByLabel('Meta (COP)').fill('750000');
    await page.getByRole('button', { name: 'Crear campaña' }).click();

    await expect(page.getByText(/Request failed with status code/)).toHaveText(
      'Request failed with status code 400',
      { timeout: 15_000 },
    );
    await expect(page).toHaveURL(/\/web-manager\/campaigns\/new$/);
    // `saving` must be released in the finally block, or the operator is stuck with
    // a permanently disabled button after a recoverable error.
    await expect(page.getByRole('button', { name: 'Crear campaña' })).toBeEnabled();
  });
});

test.describe('Web Manager — Profile', () => {
  test.beforeEach(async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
  });

  test(
    'should display profile page for web_manager with common profile elements',
    { tag: [...WEB_MANAGER_PROFILE, '@outcome:display'] },
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
    { tag: [...WEB_MANAGER_PROFILE, '@outcome:display'] },
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
    { tag: [...WEB_MANAGER_PROFILE, '@outcome:display'] },
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
  test.beforeEach(async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
  });

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
  test.beforeEach(async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
  });

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
