import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { ANIMAL_BROWSE, ANIMAL_FILTER, ANIMAL_DETAIL, ANIMAL_GALLERY } from '../helpers/flow-tags';

test.describe('Animal Browse & Detail', () => {
  test('should display animal listing page', { tag: [...ANIMAL_BROWSE] }, async ({ page }) => {
    await page.goto('/animales');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*animales/);
    await expect(page.getByRole('heading', { name: /Animales en adopción/i })).toBeVisible();
    await expect(page.getByText(/Encuentra a tu próximo compañero/i)).toBeVisible();
  });

  test('should show filter dropdowns on animal listing', { tag: [...ANIMAL_FILTER] }, async ({ page }) => {
    await page.goto('/animales');
    await waitForPageLoad(page);

    await expect(page.getByRole('combobox').first()).toBeVisible();

    const speciesSelect = page.locator('select').first();
    await expect(speciesSelect).toBeVisible();
    await expect(speciesSelect).toContainText('Todas las especies');
  });

  test('should filter animals by species', { tag: [...ANIMAL_FILTER] }, async ({ page }) => {
    await page.goto('/animales');
    await waitForPageLoad(page);

    const speciesSelect = page.locator('select').first();
    await speciesSelect.selectOption('dog');

    await page.waitForTimeout(500);
    await expect(speciesSelect).toHaveValue('dog');
  });

  test('should navigate to animal detail from listing', { tag: [...ANIMAL_DETAIL] }, async ({ page }) => {
    await page.goto('/animales');
    await waitForPageLoad(page);

    const firstAnimalLink = page.locator('a[href*="/animales/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animales\/\d+/, { timeout: 10_000 });

      await expect(page).toHaveURL(/.*animales\/\d+/);
    }
  });

  test('should display animal detail with info sections', { tag: [...ANIMAL_DETAIL] }, async ({ page }) => {
    await page.goto('/animales');
    await waitForPageLoad(page);

    const firstAnimalLink = page.locator('a[href*="/animales/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animales\/\d+/, { timeout: 10_000 });

      await expect(page.getByRole('link', { name: /Volver a animales/i })).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should show adoption CTA for unauthenticated users', { tag: [...ANIMAL_DETAIL] }, async ({ page }) => {
    await page.goto('/animales');
    await waitForPageLoad(page);

    const firstAnimalLink = page.locator('a[href*="/animales/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animales\/\d+/, { timeout: 10_000 });

      await expect(page.getByRole('link', { name: /Inicia sesión para adoptar/i })).toBeVisible();
    }
  });

  test('should display animal gallery section', { tag: [...ANIMAL_GALLERY] }, async ({ page }) => {
    await page.goto('/animales');
    await waitForPageLoad(page);

    const firstAnimalLink = page.locator('a[href*="/animales/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animales\/\d+/, { timeout: 10_000 });

      // Gallery component should be rendered in the detail page
      await expect(page.locator('.grid, .swiper, img').first()).toBeVisible();
    }
  });
});
