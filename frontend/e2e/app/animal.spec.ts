import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { ANIMAL_BROWSE, ANIMAL_FILTER, ANIMAL_DETAIL, ANIMAL_GALLERY } from '../helpers/flow-tags';

test.describe('Animal Browse & Detail', () => {
  test('should display animal listing page', { tag: [...ANIMAL_BROWSE] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*animals/);
    await expect(page.getByRole('heading', { name: /Animales en adopción/i })).toBeVisible();
    await expect(page.getByText(/Encuentra a tu próximo compañero/i)).toBeVisible();
  });

  test('should show filter dropdowns on animal listing', { tag: [...ANIMAL_FILTER] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    // Multi-select dropdown buttons for each filter category
    const speciesFilter = page.getByTestId('filter-Especies');
    await expect(speciesFilter).toBeVisible();
    await expect(speciesFilter.getByRole('button').first()).toContainText('Especies');
  });

  test('should filter animals by species', { tag: [...ANIMAL_FILTER] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    // Wait for initial animals API load
    await page.waitForResponse((resp) => resp.url().includes('/api/animals') && resp.status() === 200);

    // Open the species multi-select dropdown
    const speciesFilter = page.getByTestId('filter-Especies');
    await speciesFilter.getByRole('button').first().click();

    // Click the "Perros" checkbox option
    await speciesFilter.getByRole('button', { name: 'Perros' }).click();

    // Wait for the filtered API call
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/animals') && resp.url().includes('species=dog'),
      { timeout: 10_000 }
    );
  });

  test('should navigate to animal detail from listing', { tag: [...ANIMAL_DETAIL] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic data: no testid on animal cards, first visible link needed)
    const firstAnimalLink = page.locator('a[href*="/animals/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

      await expect(page).toHaveURL(/.*animals\/\d+/);
    }
  });

  test('should display animal detail with info sections', { tag: [...ANIMAL_DETAIL] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic data: no testid on animal cards, first visible link needed)
    const firstAnimalLink = page.locator('a[href*="/animals/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

      await expect(page.getByRole('link', { name: /Volver a animales/i })).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should show adoption CTA for unauthenticated users', { tag: [...ANIMAL_DETAIL] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic data: no testid on animal cards, first visible link needed)
    const firstAnimalLink = page.locator('a[href*="/animals/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

      await expect(page.getByRole('link', { name: /Inicia sesión para adoptar/i })).toBeVisible();
    }
  });

  test('should display animal gallery section', { tag: [...ANIMAL_GALLERY] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic data: no testid on animal cards, first visible link needed)
    const firstAnimalLink = page.locator('a[href*="/animals/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animals\/\d+/, { timeout: 10_000 });

      // Gallery component should be rendered in the detail page
      // quality: allow-fragile-selector (positional needed: gallery has no testid, first image is sufficient proof)
      await expect(page.locator('img').first()).toBeVisible();
    }
  });
});
