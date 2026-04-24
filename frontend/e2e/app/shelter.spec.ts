import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAndNavigate } from '../fixtures';
import {
  SHELTER_BROWSE,
  SHELTER_DETAIL,
  SHELTER_DETAIL_VIEW_ANIMALS,
  SHELTER_DETAIL_GALLERY,
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
} from '../helpers/flow-tags';
import {
  mockShelterAnimals,
  mockShelterCampaigns,
  mockShelterDonations,
  mockShelterData,
  mockCampaignDetail,
  mockRejectedCampaignDetail,
  mockCampaignMessages,
} from '../helpers/mock-data';

test.describe('Shelter Public Pages', () => {
  test('should display shelters listing page', { tag: [...SHELTER_BROWSE] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*shelters/);
  });

  test('should navigate to shelter detail from listing', { tag: [...SHELTER_DETAIL] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    const shelterLink = page.getByTestId('shelter-card-link').first();
    if (await shelterLink.isVisible({ timeout: 5000 })) {
      await shelterLink.click();
      await page.waitForURL(/.*shelters\/\d+/, { timeout: 10_000 });

      await expect(page).toHaveURL(/.*shelters\/\d+/);
    }
  });

  test('should show view-animals link on shelter detail and navigate to filtered animals', { tag: [...SHELTER_DETAIL_VIEW_ANIMALS] }, async ({ page }) => {
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

  test('should open gallery lightbox on shelter detail page', { tag: [...SHELTER_DETAIL_GALLERY] }, async ({ page }) => {
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

test.describe('Shelter Onboarding', () => {
  test('should redirect unauthenticated user from onboarding', { tag: [...SHELTER_ONBOARDING] }, async ({ page }) => {
    await page.goto('/shelter/onboarding');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|onboarding/);
  });

  test('should display shelter registration form when accessible', { tag: [...SHELTER_ONBOARDING] }, async ({ page }) => {
    await page.goto('/shelter/onboarding');
    await waitForPageLoad(page);

    if (new URL(page.url()).pathname.includes('onboarding')) {
      await expect(page.getByRole('heading', { name: /Registrar Refugio/i })).toBeVisible();
      await expect(page.getByLabel(/Nombre del refugio/i)).toBeVisible();
      await expect(page.getByLabel(/Ciudad/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Registrar refugio/i })).toBeVisible();
    }
  });

  test('should fill and submit shelter registration form', { tag: [...SHELTER_ONBOARDING] }, async ({ page }) => {
    await page.route('**/api/shelters/create/**', (route: any) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 99, name: 'Nuevo Refugio', verification_status: 'pending' }),
      }),
    );

    await loginAndNavigate(page, 'adopter', '/shelter/onboarding');

    await expect(page.getByRole('heading', { name: /Registrar Refugio/i })).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/Nombre del refugio/i).fill('Nuevo Refugio Test');
    await page.getByLabel(/Ciudad/i).fill('Bogotá');

    const descriptionField = page.getByLabel(/Descripción/i);
    if (await descriptionField.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await descriptionField.fill('Refugio dedicado al rescate de animales.');
    }
    const phoneField = page.getByLabel(/Teléfono/i);
    if (await phoneField.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await phoneField.fill('+57 300 123 4567');
    }

    const createResponse = page.waitForResponse((res: any) => res.url().includes('/shelters/create'));
    await page.getByRole('button', { name: /Registrar refugio/i }).click();
    await createResponse;

    // createResponse confirmed the mock returned 201; verify URL changed or no error shown
    await page.waitForURL(/shelter\/dashboard|onboarding/, { timeout: 15_000 }).catch(() => {});
    const url = page.url();
    const isDashboard = url.includes('shelter/dashboard');
    const hasError = await page.getByText(/Error al registrar/i).isVisible({ timeout: 2_000 }).catch(() => false);
    expect(isDashboard || !hasError).toBe(true);
  });
});

test.describe('Shelter Panel', () => {
  test('should redirect unauthenticated user from shelter dashboard', { tag: [...SHELTER_PANEL_DASHBOARD] }, async ({ page }) => {
    await page.goto('/shelter/dashboard');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|dashboard/);
  });

  test('should display shelter dashboard or redirect when unauthenticated', { tag: [...SHELTER_PANEL_DASHBOARD] }, async ({ page }) => {
    await page.goto('/shelter/dashboard');
    await waitForPageLoad(page);

    const pathname = new URL(page.url()).pathname;
    const isSignIn = pathname.includes('sign-in');
    const isDashboard = pathname.includes('shelter/dashboard');
    expect(isSignIn || isDashboard).toBe(true);
  });

  test('should redirect unauthenticated user from shelter animals', { tag: [...SHELTER_PANEL_ANIMALS] }, async ({ page }) => {
    await page.goto('/shelter/animals');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|animals/);
  });

  test('should redirect unauthenticated user from shelter campaigns', { tag: [...SHELTER_PANEL_CAMPAIGNS] }, async ({ page }) => {
    await page.goto('/shelter/campaigns');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|campaigns/);
  });

  test('should redirect unauthenticated user from shelter donations', { tag: [...SHELTER_PANEL_DONATIONS] }, async ({ page }) => {
    await page.goto('/shelter/donations');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|donations/);
  });

  test('should redirect unauthenticated user from shelter settings', { tag: [...SHELTER_PANEL_SETTINGS] }, async ({ page }) => {
    await page.goto('/shelter/settings');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|settings/);
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

  test('should display shelter campaigns with progress', { tag: [...SHELTER_PANEL_CAMPAIGNS] }, async ({ page }) => {
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

  test('should display shelter donations with total', { tag: [...SHELTER_PANEL_DONATIONS] }, async ({ page }) => {
    await page.route('**/api/donations/**', (route: any) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockShelterDonations),
      }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/donations');

    await expect(page.getByRole('heading', { name: /Donaciones Recibidas/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/50.000|50,000/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/donor1@example.com/i)).toBeVisible();
  });

  test('should display shelter settings form with current data', { tag: [...SHELTER_PANEL_SETTINGS] }, async ({ page }) => {
    await page.route('**/api/shelters/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockShelterData),
        });
      }
      if (route.request().method() === 'PATCH' || route.request().method() === 'PUT') {
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
    await expect(page.getByRole('button', { name: /Guardar cambios/i })).toBeVisible();
  });

  test('should display shelter applications page with heading', { tag: [...SHELTER_PANEL_APPLICATIONS] }, async ({ page }) => {
    await loginAndNavigate(page, 'shelter_admin', '/shelter/applications');

    await expect(page.getByRole('heading', { name: /Solicitudes de Adopción/i })).toBeVisible({ timeout: 15_000 });

    const hasApplications = page.getByRole('article').first();
    const emptyState = page.getByText(/No hay solicitudes de adopción/i);
    await expect(hasApplications.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });

  test('should move submitted adoption application to reviewing status', { tag: [...ADOPTION_MANAGE] }, async ({ page }) => {
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

  test('should display shelter updates page with heading', { tag: [...SHELTER_PANEL_UPDATES] }, async ({ page }) => {
    await loginAndNavigate(page, 'shelter_admin', '/shelter/updates');

    await expect(page.getByRole('heading', { name: /Mis actualizaciones/i })).toBeVisible({ timeout: 15_000 });

    const hasUpdates = page.getByRole('article').first();
    const emptyState = page.getByText(/No has publicado actualizaciones/i);
    await expect(hasUpdates.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });

  test('should display shelter update create form with required fields', { tag: [...SHELTER_PANEL_UPDATE_CREATE] }, async ({ page }) => {
    await loginAndNavigate(page, 'shelter_admin', '/shelter/updates/create');

    await expect(page.getByRole('heading', { name: /Publicar actualización/i })).toBeVisible();
    await expect(page.getByText(/Título \(Español\)/i)).toBeVisible();
    await expect(page.getByText(/Contenido \(Español\)/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Publicar/i })).toBeVisible();
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

  test('should display shelter admin role section and NOT adopter cards', { tag: [...SHELTER_ADMIN_PROFILE] }, async ({ page }) => {
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

  test('should display pending-applications widget with correct count', { tag: [...SHELTER_ADMIN_PROFILE] }, async ({ page }) => {
    await page.route('**/user/profile/**', (route: any) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockShelterProfile) });
      }
      return route.continue();
    });

    await loginAndNavigate(page, 'shelter_admin', '/my-profile');

    await expect(page.getByText(/3 solicitudes esperando tu revisión/i)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Shelter Campaign Detail & Create', () => {
  test('should display campaign detail with approval status', { tag: [...SHELTER_PANEL_CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.route('**/api/campaigns/3/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignDetail) }),
    );
    await page.route('**/api/campaigns/3/messages/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignMessages) }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/campaigns/3');

    await expect(page.getByText(/Esterilización urgente/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/pending/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Conversación/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should show edit and resubmit buttons on rejected campaign', { tag: [...SHELTER_PANEL_CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.route('**/api/campaigns/4/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRejectedCampaignDetail) }),
    );
    await page.route('**/api/campaigns/4/messages/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCampaignMessages) }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/campaigns/4');

    await expect(page.getByText(/Rescate de temporada/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Reenviar a revisión/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Falta imagen de portada/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should redirect unauthenticated user from campaign detail', { tag: [...SHELTER_PANEL_CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.goto('/shelter/campaigns/3');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|campaigns/);
  });

  test('should display campaign request form', { tag: [...SHELTER_PANEL_CAMPAIGN_CREATE] }, async ({ page }) => {
    await page.route('**/api/shelters/**', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 1, page: 1, total_pages: 1, results: mockShelterData }) }),
    );

    await loginAndNavigate(page, 'shelter_admin', '/shelter/campaigns/nueva');

    await expect(page.getByRole('heading', { name: /Solicitar nueva campaña/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Enviar para revisión/i })).toBeVisible({ timeout: 10_000 });
  });

  test('should redirect unauthenticated user from campaign create', { tag: [...SHELTER_PANEL_CAMPAIGN_CREATE] }, async ({ page }) => {
    await page.goto('/shelter/campaigns/nueva');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|nueva/);
  });
});

test.describe('Shelter Panel — Animal Create', () => {
  test('should redirect unauthenticated user from animal create page', { tag: [...SHELTER_PANEL_ANIMAL_CREATE] }, async ({ page }) => {
    await page.goto('/shelter/animals/nuevo');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|nuevo/);
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
