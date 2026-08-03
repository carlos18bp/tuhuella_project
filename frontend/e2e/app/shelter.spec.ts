import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate, loginAs } from '../fixtures';
import {
  SHELTER_BROWSE,
  SHELTER_DETAIL,
  SHELTER_DETAIL_VIEW_ANIMALS,
  SHELTER_DETAIL_GALLERY,
  SHELTER_DETAIL_VIDEO,
  SHELTER_ONBOARDING,
  SHELTER_PANEL_DASHBOARD,
  SHELTER_PANEL_ANIMALS,
  SHELTER_PANEL_CAMPAIGNS,
  SHELTER_PANEL_DONATIONS,
  SHELTER_PANEL_SETTINGS,
  SHELTER_PANEL_APPLICATIONS,
  SHELTER_PANEL_UPDATES,
  SHELTER_PANEL_UPDATE_CREATE,
  ADOPTION_MANAGE,
  SHELTER_ADMIN_PROFILE,
  SHELTER_PANEL_CAMPAIGN_DETAIL,
  SHELTER_PANEL_CAMPAIGN_CREATE,
  SHELTER_PANEL_ANIMAL_CREATE,
  SHELTER_PANEL_CAMPAIGN_MESSAGES,
} from '../helpers/flow-tags';
import {
  mockShelterAnimals,
  mockShelterCampaigns,
  mockShelterDonations,
  mockShelterData,
  mockShelterMetrics,
  mockShelterUpdates,
  mockCampaignDetail,
  mockRejectedCampaignDetail,
  mockCampaignMessages,
} from '../helpers/mock-data';
import { paceRequestsUnderRateLimit } from '../helpers/pacing';

// Field names mirror what ShelterCard.tsx actually reads (name, city, description,
// is_verified, cover_image_url/logo_url) — mockShelterData carries `verification_status`
// instead, which the card ignores, so a fixture built from it would render a nameless
// card and make every assertion below vacuous.
const mockSheltersListing = [
  { id: 7, name: 'Refugio Patitas', city: 'Bogotá', description: 'Rescate y adopción responsable.', is_verified: true, cover_image_url: '', logo_url: '' },
  { id: 8, name: 'Hogar Esperanza', city: 'Medellín', description: 'Refugio de acogida temporal.', is_verified: false, cover_image_url: '', logo_url: '' },
];

test.describe('Shelter Public Pages', () => {
  // Walks the header → listing edge and pins a card's href. The previous body was
  // goto('/shelters') + toHaveURL(/.*shelters/) — a tautology that cannot fail after its
  // own navigation. Catches Header.tsx:84 losing ROUTES.SHELTERS and the listing
  // rendering zero cards.
  test('should display shelters listing page', { tag: [...SHELTER_BROWSE, '@outcome:display'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);
    // Mocked on EVERY target, not just CI: the deployed GET /api/shelters/?lang=es answers
    // HTTP 500 (re-confirmed 2026-08-02, 4 consecutive calls), so no real row can reach the
    // grid and the card edge would be untestable there. Restore the campaign.spec.ts
    // conditional (real payload when PLAYWRIGHT_BASE_URL is set) once that endpoint is fixed.
    await page.route('**/api/shelters/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSheltersListing) }),
    );

    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Refugios' }).click({ timeout: 20_000 });
    await page.waitForURL(/\/shelters$/, { timeout: 20_000 });

    await expect(page.locator('h1')).toHaveText('Refugios verificados');
    const firstCard = page.getByTestId('shelter-card-link').first();
    // ShelterCard uses the next-intl Link, so the href carries the locale prefix; pinning
    // it whole also catches the prefix being dropped, which 404s every card.
    await expect(firstCard).toHaveAttribute('href', '/es/shelters/7');
    await expect(firstCard).toContainText('Refugio Patitas');
  });

  test('should navigate to shelter detail from listing', { tag: [...SHELTER_DETAIL, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    const shelterLink = page.getByTestId('shelter-card-link').first();
    if (await shelterLink.isVisible({ timeout: 5000 })) {
      await shelterLink.click();
      await page.waitForURL(/.*shelters\/\d+/, { timeout: 10_000 });

      await expect(page).toHaveURL(/.*shelters\/\d+/);
    }
  });

  test('should show view-animals link on shelter detail and navigate to filtered animals', { tag: [...SHELTER_DETAIL_VIEW_ANIMALS, '@outcome:success'] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    const shelterLink = page.getByTestId('shelter-card-link').first();
    if (await shelterLink.isVisible({ timeout: 5000 })) {
      await shelterLink.click();
      await page.waitForURL(/.*shelters\/\d+/, { timeout: 10_000 });

      const viewAnimalsLink = page.getByRole('link', { name: /ver animales/i });
      await expect(viewAnimalsLink).toBeVisible({ timeout: 10_000 });
      await viewAnimalsLink.click();

      await expect(page).toHaveURL(/.*animals.*shelter=\d+/);
    }
  });

  test('should open video modal on shelter detail page', { tag: [...SHELTER_DETAIL_VIDEO, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-deep-link (listing→detail navigation is owned by shelter-detail's click test; this spec isolates the video modal on an already-reached page)
    const shelterWithVideo = {
      id: 4242,
      name: 'Refugio E2E con Video',
      legal_name: '',
      description: 'Refugio de prueba con video.',
      city: 'Bogotá',
      address: '',
      phone: '+57 300 000 0000',
      email: '',
      website: '',
      verification_status: 'verified',
      verified_at: '2026-01-15T10:00:00Z',
      is_verified: true,
      owner_email: 'shelter@example.com',
      logo_url: '',
      cover_image_url: '',
      gallery_urls: [],
      video_url: '/media/shelters/videos/refugio-e2e.mp4',
      created_at: '2026-01-01T08:00:00Z',
    };

    await page.route('**/api/shelters/4242/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(shelterWithVideo),
      }),
    );

    await page.goto('/shelters/4242');
    await waitForPageLoad(page);

    const playButton = page.getByRole('button', { name: /ver video/i });
    await expect(playButton).toBeVisible({ timeout: 10_000 });

    await playButton.click();

    const dialog = page.getByRole('dialog', { name: /video/i });
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    const player = page.getByTestId('shelter-video-player');
    await expect(player).toBeVisible();
    await expect(player).toHaveAttribute('src', shelterWithVideo.video_url);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('should open gallery lightbox on shelter detail page', { tag: [...SHELTER_DETAIL_GALLERY, '@outcome:display'] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    const shelterLink = page.getByTestId('shelter-card-link').first();
    if (await shelterLink.isVisible({ timeout: 5000 })) {
      await shelterLink.click();
      await page.waitForURL(/.*shelters\/\d+/, { timeout: 10_000 });

      const gallerySection = page.locator('section, div', { has: page.getByRole('heading', { name: /gallery|galería/i }) });
      const galleryButton = gallerySection.getByRole('button').first();
      if (await galleryButton.isVisible({ timeout: 5000 })) {
        await galleryButton.click();

        const lightbox = page.getByRole('dialog', { name: /Lightbox/i });
        await expect(lightbox).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('Shelter Onboarding (legacy redirect)', () => {
  test('legacy /shelter/onboarding redirects to /shelter-application', { tag: [...SHELTER_ONBOARDING, '@outcome:success'] }, async ({ page }) => {
    // quality: allow-no-interaction (legacy redirect stub: the page's entire DOM is a single
    // <p>Redirigiendo…</p> and its only behavior is a useEffect calling router.replace —
    // shelter/onboarding/page.tsx:1-20 is the complete file, with no button, link, input or
    // form to drive. Nothing in the product links here either: grepping
    // SHELTER_ONBOARDING|shelter/onboarding across app/, components/ and lib/ returns exactly
    // one hit, the route declaration at lib/constants.ts:38.)
    // Authenticating first collapses the old shelter-application|sign-in alternation: /shelter
    // is proxy-protected (proxy.ts:8-19) while /shelter-application is not, so an anonymous
    // run could satisfy the assertion by never redirecting at all.
    await paceRequestsUnderRateLimit(page);
    await loginAndNavigate(page, 'adopter', '/shelter/onboarding');
    await page.waitForURL(/\/shelter-application$/, { timeout: 20_000 });

    await expect(page).toHaveURL(/\/shelter-application$/);
  });
});

test.describe('Shelter Panel', () => {
  test('should redirect unauthenticated user from shelter dashboard', { tag: [...SHELTER_PANEL_DASHBOARD] }, async ({ page }) => {
    await page.goto('/shelter/dashboard');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should display shelter dashboard or redirect when unauthenticated', { tag: [...SHELTER_PANEL_DASHBOARD, '@outcome:display'] }, async ({ page }) => {
    await page.route('**/api/shelters/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterData) });
      }
      return route.continue();
    });
    await page.route('**/api/admin/shelter/metrics/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterMetrics) }),
    );

    await loginAs(page, 'shelter_admin');
    await page.getByRole('button', { name: 'Panel Refugio' }).click();
    await page.getByRole('menuitem', { name: 'Dashboard' }).click();
    await page.waitForURL(/\/shelter\/dashboard/, { timeout: 10_000 });

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(mockShelterData[0].name);
    await expect(page.getByText(/Resumen de tu refugio/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should redirect unauthenticated user from shelter animals', { tag: [...SHELTER_PANEL_ANIMALS] }, async ({ page }) => {
    await page.goto('/shelter/animals');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from shelter campaigns', { tag: [...SHELTER_PANEL_CAMPAIGNS] }, async ({ page }) => {
    await page.goto('/shelter/campaigns');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from shelter donations', { tag: [...SHELTER_PANEL_DONATIONS] }, async ({ page }) => {
    await page.goto('/shelter/donations');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should redirect unauthenticated user from shelter settings', { tag: [...SHELTER_PANEL_SETTINGS] }, async ({ page }) => {
    await page.goto('/shelter/settings');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Shelter Panel — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display shelter animals with filter tabs', { tag: [...SHELTER_PANEL_ANIMALS] }, async ({ page }) => {
    await page.route('**/api/animals/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: mockShelterAnimals.length,
          page: 1,
          page_size: 20,
          total_pages: 1,
          results: mockShelterAnimals,
        }),
      }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/animals');

    await expect(page.getByRole('heading', { name: /Gestión de Animales/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Luna')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Milo')).toBeVisible();
    await expect(page.getByText(/3 animales registrados/i)).toBeVisible();

    const publishedFilter = page.getByRole('button', { name: /published|publicado/i });
    if (await publishedFilter.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await publishedFilter.click();
    }
  });

  test('should display shelter campaigns with progress', { tag: [...SHELTER_PANEL_CAMPAIGNS, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (read-only list render: this spec asserts the two mocked campaigns are listed; creating and editing a campaign are separate flows with their own specs, and loginAndNavigate seeds the session by cookie rather than filling a login form, so there is no interactable step in scope)
    await page.route('**/api/campaigns/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockShelterCampaigns),
      }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/campaigns');

    await expect(page.getByRole('heading', { name: /Mis Campañas/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Campaña de vacunación/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Alimento para refugio/i)).toBeVisible();
  });

  test('should display shelter donations with total', { tag: [...SHELTER_PANEL_DONATIONS, '@outcome:display'] }, async ({ page }) => {
    await page.route('**/api/donations/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockShelterDonations),
      }),
    );

    await loginAs(page, 'shelter_admin');
    await page.getByRole('button', { name: 'Panel Refugio' }).click();
    await page.getByRole('menuitem', { name: 'Donaciones' }).click();
    await page.waitForURL(/\/shelter\/donations/, { timeout: 10_000 });

    await expect(page.getByRole('heading', { name: /Donaciones Recibidas/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/50.000|50,000/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/donor1@example.com/i)).toBeVisible();
  });

  test('should display shelter settings form with current data', { tag: [...SHELTER_PANEL_SETTINGS, '@outcome:success'] }, async ({ page }) => {
    let patchBody = '';
    await page.route('**/api/shelters/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockShelterData),
        });
      }
      if (route.request().method() === 'PATCH' || route.request().method() === 'PUT') {
        patchBody = route.request().postData() ?? '';
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...mockShelterData[0], name: 'Refugio E2E Editado' }),
        });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'shelter_admin', '/shelter/settings');

    await expect(page.getByRole('heading', { name: /Configuración del Refugio/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/Nombre/i).first()).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/Nombre/i).first().fill('Refugio E2E Editado');
    await page.getByRole('button', { name: /Guardar cambios/i }).click();

    await expect(page.getByText('Cambios guardados correctamente')).toBeVisible({ timeout: 10_000 });
    await expect.poll(() => patchBody, { timeout: 5_000 }).toContain('Refugio E2E Editado');
  });

  test('should move submitted adoption application to reviewing status', { tag: [...ADOPTION_MANAGE, ...SHELTER_PANEL_APPLICATIONS, '@outcome:success'] }, async ({ page }) => {
    const baseApp = {
      id: 501,
      animal: 1,
      animal_name: 'Luna',
      animal_species: 'dog',
      user: 2,
      user_email: 'adopter@example.com',
      status: 'submitted' as const,
      form_answers: {},
      created_at: '2026-03-01T10:00:00Z',
    };
    let apps: typeof baseApp[] = [baseApp];

    await page.route('**/api/adoptions/**', (route: any) => {
      const url = route.request().url();
      const method = route.request().method();
      if (method === 'PATCH' && /\/adoptions\/\d+\/status\//.test(url)) {
        apps = [{ ...apps[0], status: 'reviewing' }];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apps[0]),
        });
      }
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apps),
        });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'shelter_admin', '/shelter/applications');

    await expect(page.getByRole('button', { name: 'Revisar' })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Revisar' }).click();

    await expect(page.getByText('En revisión')).toBeVisible({ timeout: 10_000 });
  });

  test('should display shelter updates page with heading', { tag: [...SHELTER_PANEL_UPDATES, '@outcome:success'] }, async ({ page }) => {
    await page.route('**/api/shelters/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterData) });
      }
      return route.continue();
    });
    await page.route('**/api/updates/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterUpdates) }),
    );
    // Registered after the general updates route so it wins for the delete call.
    await page.route(/\/api\/updates\/\d+\/delete\//, (route: any) => route.fulfill({ status: 204, body: '' }));

    await loginAndNavigate(page, 'shelter_admin', '/shelter/updates');

    await expect(page.getByRole('heading', { name: /Mis actualizaciones/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(mockShelterUpdates[0].title)).toBeVisible({ timeout: 10_000 });

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /Eliminar/i }).first().click();

    await expect(page.getByText(mockShelterUpdates[0].title)).not.toBeVisible({ timeout: 10_000 });
  });

  test('should display shelter update create form with required fields', { tag: [...SHELTER_PANEL_UPDATE_CREATE, '@outcome:success'] }, async ({ page }) => {
    await page.route('**/api/shelters/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterData) });
      }
      return route.continue();
    });
    await page.route('**/api/campaigns/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    await page.route('**/api/animals/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    await page.route('**/api/updates/create/**', (route: any) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 55, title: 'Vacunación al día', shelter: 1 }) }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/updates/create');

    await expect(page.getByRole('heading', { name: /Publicar actualización/i })).toBeVisible();
    await expect(page.getByText(/Título \(Español\)/i)).toBeVisible();
    await expect(page.getByText(/Contenido \(Español\)/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Publicar/i })).toBeVisible();

    // Labels here have no htmlFor/id (accessibility gap in updates/create/page.tsx:98-110),
    // so getByLabel cannot resolve them; role+position is the stable fallback (all four
    // fields share role="textbox" in fixed DOM order: title ES, title EN, content ES, content EN).
    const fields = page.locator('form').getByRole('textbox');
    await fields.nth(0).fill('Vacunación al día');
    await fields.nth(2).fill('Todos los animales fueron vacunados esta semana.');
    await page.getByRole('button', { name: /Publicar actualización/i }).click();

    await expect(page).toHaveURL(/shelter\/updates$/, { timeout: 10_000 });
  });

  test('shows an error message when publishing an update fails', { tag: [...SHELTER_PANEL_UPDATE_CREATE, '@outcome:failure'] }, async ({ page }) => {
    await page.route('**/api/shelters/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterData) });
      }
      return route.continue();
    });
    await page.route('**/api/campaigns/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    await page.route('**/api/animals/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    // Body has neither `error` nor `detail`, so ShelterUpdateCreatePage falls back to its
    // translated copy (updates/create/page.tsx:73) instead of echoing the response.
    await page.route('**/api/updates/create/**', (route: any) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({}) }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/updates/create');

    const fields = page.locator('form').getByRole('textbox');
    await fields.nth(0).fill('Vacunación al día');
    await fields.nth(2).fill('Todos los animales fueron vacunados esta semana.');
    await page.getByRole('button', { name: /Publicar actualización/i }).click();

    await expect(page.getByText('Error al publicar la actualización')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Shelter Admin Profile — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  const mockShelterProfile = {
    id: 1,
    email: 'shelter-e2e@example.com',
    first_name: 'Refugio',
    last_name: 'Admin',
    phone: '+57 300 000 0000',
    city: 'Bogotá',
    role: 'shelter_admin',
    is_staff: false,
    is_active: true,
    date_joined: '2025-01-01T00:00:00Z',
    shelter: { name: 'Refugio E2E', verification_status: 'verified' },
    shelter_stats: { animals_count: 5, pending_applications: 3, active_campaigns: 1 },
  };

  test('should display shelter admin role section and NOT adopter cards', { tag: [...SHELTER_ADMIN_PROFILE, '@outcome:display'] }, async ({ page }) => {
    await page.route('**/user/profile/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterProfile) });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'shelter_admin', '/my-profile');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    const shelterSection = page.getByText(/Responsabilidades del refugio/i);
    await expect(shelterSection).toBeVisible({ timeout: 10_000 });

    await expect(page.getByRole('main').getByText(/Mis Solicitudes/i)).not.toBeVisible();
    await expect(page.getByRole('main').getByText(/Mis Donaciones/i)).not.toBeVisible();
  });

  // The count is the hook, the link is the payoff: my-profile/page.tsx:127-146 wraps the whole
  // widget in a <Link href={ROUTES.SHELTER_APPLICATIONS}> (:429). Point that href anywhere else
  // and the widget still renders the right number while stranding the shelter admin — which the
  // count-only assertion below would never notice.
  test('should display pending-applications widget with correct count', { tag: [...SHELTER_ADMIN_PROFILE, '@outcome:display'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);
    await page.route('**/user/profile/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterProfile) });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'shelter_admin', '/my-profile');

    const pendingWidget = page.getByRole('link', { name: /3 solicitudes esperando tu revisión/i });
    await expect(pendingWidget).toBeVisible({ timeout: 10_000 });
    await pendingWidget.click();

    await expect(page).toHaveURL(/\/shelter\/applications$/);
  });
});

test.describe('Shelter Campaign Detail & Create', () => {
  test('should display campaign detail with approval status', { tag: [...SHELTER_PANEL_CAMPAIGN_DETAIL, '@outcome:display'] }, async ({ page }) => {
    await page.route('**/api/campaigns/mine/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterCampaigns) }),
    );
    await page.route('**/api/campaigns/3/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignDetail) }),
    );
    await page.route('**/api/campaigns/3/messages/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignMessages) }),
    );

    await loginAs(page, 'shelter_admin');
    await page.getByRole('button', { name: 'Panel Refugio' }).click();
    await page.getByRole('menuitem', { name: 'Campañas' }).click();
    await page.waitForURL(/\/shelter\/campaigns$/, { timeout: 10_000 });

    await page.getByRole('link', { name: /Esterilización urgente/i }).click();
    await page.waitForURL(/\/shelter\/campaigns\/3/, { timeout: 10_000 });

    await expect(page.getByText(/Esterilización urgente/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/pending/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Conversación/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should show edit and resubmit buttons on rejected campaign', { tag: [...SHELTER_PANEL_CAMPAIGN_DETAIL, '@outcome:display', '@outcome:success'] }, async ({ page }) => {
    await page.route('**/api/campaigns/4/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRejectedCampaignDetail) }),
    );
    await page.route('**/api/campaigns/4/messages/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignMessages) }),
    );
    // Registered after the general campaign route so it wins for the resubmit action —
    // submitForApproval sets `campaign` straight from this response (campaignStore.ts:101-107),
    // so without this override the blanket /campaigns/4/** handler above would answer the
    // resubmit POST too and the campaign would silently stay 'rejected'.
    await page.route('**/api/campaigns/4/submit/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockRejectedCampaignDetail, approval_status: 'pending', reviewed_at: null, reviewed_by: null, reviewed_by_name: null }),
      }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/campaigns/4');

    await expect(page.getByText(/Rescate de temporada/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Reenviar a revisión/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Falta imagen de portada/i).first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Reenviar a revisión' }).click();

    await expect(page.getByText(/Estado de revisión:\s*pending/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Reenviar a revisión' })).not.toBeVisible({ timeout: 10_000 });
  });

  test('should redirect unauthenticated user from campaign detail', { tag: [...SHELTER_PANEL_CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.goto('/shelter/campaigns/3');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should display campaign request form', { tag: [...SHELTER_PANEL_CAMPAIGN_CREATE, '@outcome:success'] }, async ({ page }) => {
    // The page reads `res.data` as a plain array of owned shelters (nueva/page.tsx:29-31),
    // not the paginated {count,results} shape — the previous mock's wrapper meant
    // `.map()` threw silently (swallowed by the missing catch) and shelterId never
    // resolved; harmless for a visibility-only check, fatal for an actual submit.
    await page.route('**/api/shelters/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterData) });
      }
      return route.continue();
    });
    await page.route('**/api/campaigns/create/**', (route: any) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockCampaignDetail, id: 42, title: 'Campaña de esterilización E2E', title_es: 'Campaña de esterilización E2E' }),
      }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/campaigns/nueva');

    await expect(page.getByRole('heading', { name: /Solicitar nueva campaña/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Enviar para revisión/i })).toBeVisible({ timeout: 10_000 });

    await page.getByLabel('Título').fill('Campaña de esterilización E2E');
    await page.getByLabel(/Meta/i).fill('500000');
    await page.getByRole('button', { name: /Enviar para revisión/i }).click();

    await expect(page).toHaveURL(/shelter\/campaigns\/42/, { timeout: 10_000 });
  });

  // Whitespace, not empty: the guard is `!title.trim() || !goal`
  // (nueva/page.tsx:47), and spaces are what a natively required field accepts.
  // Asserting the POST never fires is the half that matters — a message shown while
  // the request still goes out would create a campaign titled with blanks.
  test('refuses to submit a campaign with a blank title', { tag: [...SHELTER_PANEL_CAMPAIGN_CREATE, '@outcome:error'] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    let posted = false;
    await page.route('**/api/shelters/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterData) });
      }
      return route.continue();
    });
    await page.route('**/api/campaigns/create/**', (route: any) => {
      posted = true;
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 42 }) });
    });

    // Wait for the owned-shelter GET itself, not just for the form to paint: the
    // control renders before shelterId resolves, and submitting early trips the
    // EARLIER guard ("No encontramos tu refugio.", nueva/page.tsx:43) rather than the
    // one under test. Waiting on the response is the only ordering that removes it.
    const sheltersLoaded = page.waitForResponse(
      (res: any) => res.url().includes('/api/shelters') && res.request().method() === 'GET',
      { timeout: 20_000 },
    );
    await loginAndNavigate(page, 'shelter_admin', '/shelter/campaigns/nueva');
    await expect(page.getByRole('heading', { name: /Solicitar nueva campaña/i })).toBeVisible({ timeout: 15_000 });
    await sheltersLoaded;
    await expect(page.getByRole('button', { name: /Enviar para revisión/i })).toBeVisible({ timeout: 10_000 });

    await page.getByLabel('Título').fill('   ');
    await page.getByLabel(/Meta/i).fill('500000');
    await page.getByRole('button', { name: /Enviar para revisión/i }).click();

    await expect(page.getByText('Título y meta son requeridos.')).toBeVisible({ timeout: 10_000 });
    expect(posted).toBe(false);
    await expect(page).toHaveURL(/campaigns\/nueva/);
  });

  // Fails if a rejected creation navigates away as though it worked. The shelter
  // would go looking for a campaign that was never created, and re-submitting is the
  // only recovery — which they will not do if the page told them nothing.
  test('shows an error and stays on the form when campaign creation fails', { tag: [...SHELTER_PANEL_CAMPAIGN_CREATE, '@outcome:failure'] }, async ({ page }) => {
    await paceRequestsUnderRateLimit(page);
    await page.route('**/api/shelters/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterData) });
      }
      return route.continue();
    });
    await page.route('**/api/campaigns/create/**', (route: any) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({}) }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/campaigns/nueva');
    await expect(page.getByRole('heading', { name: /Solicitar nueva campaña/i })).toBeVisible({ timeout: 15_000 });

    await page.getByLabel('Título').fill('Campaña que el servidor rechaza');
    await page.getByLabel(/Meta/i).fill('500000');
    await page.getByRole('button', { name: /Enviar para revisión/i }).click();

    // The catch surfaces the thrown Error's message (nueva/page.tsx:63); whatever the
    // wording, the contract is that something is said and the router does NOT push.
    await expect(page.locator('p.text-rose-600')).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/campaigns\/nueva/);
  });

  test('should redirect unauthenticated user from campaign create', { tag: [...SHELTER_PANEL_CAMPAIGN_CREATE] }, async ({ page }) => {
    await page.goto('/shelter/campaigns/nueva');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Shelter Panel — Animal Create', () => {
  test('should redirect unauthenticated user from animal create page', { tag: [...SHELTER_PANEL_ANIMAL_CREATE] }, async ({ page }) => {
    await page.goto('/shelter/animals/nuevo');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should show "Agregar animal" CTA on animals list', { tag: [...SHELTER_PANEL_ANIMAL_CREATE] }, async ({ page }) => {
    await page.route('**/api/animals/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0, page: 1, page_size: 20, total_pages: 1, results: [] }),
      }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/animals');

    await expect(page.getByRole('heading', { name: /Gestión de Animales/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /Agregar animal/i })).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate to animal create page from animals list', { tag: [...SHELTER_PANEL_ANIMAL_CREATE] }, async ({ page }) => {
    await page.route('**/api/animals/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0, page: 1, page_size: 20, total_pages: 1, results: [] }),
      }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/animals');

    await expect(page.getByRole('heading', { name: /Gestión de Animales/i })).toBeVisible({ timeout: 15_000 });

    const addLink = page.getByRole('link', { name: /Agregar animal/i });
    await expect(addLink).toBeVisible({ timeout: 10_000 });
    await addLink.click();

    await page.waitForURL(/animals\/nuevo/, { timeout: 10_000 });
    await expect(page).toHaveURL(/animals\/nuevo/);
  });
});

test.describe('Shelter Panel Campaign Messages', () => {
  // Tagged with both classes because it verifies both, which its title already
  // said: it reads the reviewer's existing message (display) and then posts a
  // reply, asserting the request body AND that the reply renders (success). Only
  // the display tag was present, so the flow reported the send as uncovered and
  // the obvious remedy would have been a second spec duplicating this setup.
  test(
    'shelter admin reads and sends a campaign approval message',
    { tag: [...SHELTER_PANEL_CAMPAIGN_MESSAGES, '@outcome:display', '@outcome:success'] },
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
              id: 99, campaign: 3, author: 1, author_name: 'María López',
              author_role: 'shelter_admin', body: sentBody ?? '', is_system: false,
              created_at: '2026-05-04T10:00:00Z',
            }),
          });
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignMessages) });
      });

      await loginAndNavigate(page, 'shelter_admin', '/shelter/campaigns/3');

      await expect(page.getByText(/Conversación/i)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('Falta imagen de portada para la campaña.')).toBeVisible({ timeout: 10_000 });

      const composer = page.getByPlaceholder(/Escribe un mensaje/i);
      await composer.fill('Ya subí la imagen de portada, quedo atenta.');
      await page.getByRole('button', { name: 'Enviar' }).click();

      await expect.poll(() => sentBody, { timeout: 5_000 }).toContain('Ya subí la imagen de portada');
      await expect(page.getByText('Ya subí la imagen de portada, quedo atenta.')).toBeVisible({ timeout: 10_000 });
    },
  );
});
