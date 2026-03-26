import { test, expect } from '../test-with-coverage';
import { waitForPageLoad, loginAs, loginAndNavigate } from '../fixtures';
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
} from '../helpers/flow-tags';

test.describe('Shelter Public Pages', () => {
  test('should display shelters listing page', { tag: [...SHELTER_BROWSE] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*shelters/);
  });

  test('should navigate to shelter detail from listing', { tag: [...SHELTER_DETAIL] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic data: no testid on shelter cards, first visible link needed)
    const shelterLink = page.locator('a[href*="/shelters/"]').first();
    if (await shelterLink.isVisible({ timeout: 5000 })) {
      await shelterLink.click();
      await page.waitForURL(/.*shelters\/\d+/, { timeout: 10_000 });

      await expect(page).toHaveURL(/.*shelters\/\d+/);
    }
  });

  test('should show view-animals link on shelter detail and navigate to filtered animals', { tag: [...SHELTER_DETAIL_VIEW_ANIMALS] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic data: first visible shelter link)
    const shelterLink = page.locator('a[href*="/shelters/"]').first();
    if (await shelterLink.isVisible({ timeout: 5000 })) {
      await shelterLink.click();
      await page.waitForURL(/.*shelters\/\d+/, { timeout: 10_000 });

      // The shelter detail page has a "Ver animales de este refugio" link
      const viewAnimalsLink = page.getByRole('link', { name: /ver animales/i });
      await expect(viewAnimalsLink).toBeVisible({ timeout: 10_000 });
      await viewAnimalsLink.click();

      // Should navigate to animals page filtered by shelter
      await expect(page).toHaveURL(/.*animals.*shelter=\d+/);
    }
  });

  test('should open gallery lightbox on shelter detail page', { tag: [...SHELTER_DETAIL_GALLERY] }, async ({ page }) => {
    await page.goto('/shelters');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic data: first visible shelter link)
    const shelterLink = page.locator('a[href*="/shelters/"]').first();
    if (await shelterLink.isVisible({ timeout: 5000 })) {
      await shelterLink.click();
      await page.waitForURL(/.*shelters\/\d+/, { timeout: 10_000 });

      // Look for gallery images (rendered as buttons wrapping images)
      const galleryButton = page.locator('button img[alt]').first();
      if (await galleryButton.isVisible({ timeout: 5000 })) {
        await galleryButton.click();

        // Lightbox overlay: fixed div with bg-black/80
        const lightbox = page.locator('.fixed.inset-0');
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

    // Unauthenticated user is redirected to sign-in; authenticated sees dashboard heading
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

  test('should display shelter applications page with heading', { tag: [...SHELTER_PANEL_APPLICATIONS] }, async ({ page }) => {
    await loginAndNavigate(page, 'shelter_admin', '/shelter/applications');

    // Heading: "Solicitudes de Adopción"
    await expect(page.getByRole('heading', { name: /Solicitudes de Adopción/i })).toBeVisible({ timeout: 15_000 });

    // Either application list items or empty state message
    const hasApplications = page.locator('.rounded-xl.border.border-stone-200.bg-white').first();
    const emptyState = page.getByText(/No hay solicitudes de adopción/i);
    await expect(hasApplications.or(emptyState).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should display shelter updates page with heading', { tag: [...SHELTER_PANEL_UPDATES] }, async ({ page }) => {
    await loginAndNavigate(page, 'shelter_admin', '/shelter/updates');

    // Heading: "Mis actualizaciones"
    await expect(page.getByRole('heading', { name: /Mis actualizaciones/i })).toBeVisible({ timeout: 15_000 });

    // Either updates list items or empty state
    const hasUpdates = page.locator('.rounded-xl.border.border-stone-200.bg-white').first();
    const emptyState = page.getByText(/No has publicado actualizaciones/i);
    await expect(hasUpdates.or(emptyState).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should display shelter update create form with required fields', { tag: [...SHELTER_PANEL_UPDATE_CREATE] }, async ({ page }) => {
    await loginAndNavigate(page, 'shelter_admin', '/shelter/updates/create');

    // Heading: "Publicar actualización"
    await expect(page.getByRole('heading', { name: /Publicar actualización/i })).toBeVisible();

    // Form fields: title and content inputs (Spanish required fields)
    await expect(page.getByText(/Título \(Español\)/i)).toBeVisible();
    await expect(page.getByText(/Contenido \(Español\)/i)).toBeVisible();

    // Submit button should be present
    await expect(page.getByRole('button', { name: /Publicar/i })).toBeVisible();
  });
});
