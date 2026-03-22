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

    // Target the species select by its unique option content
    const speciesSelect = page.locator('select', { has: page.locator('option', { hasText: 'Todas las especies' }) });
    await expect(speciesSelect).toBeVisible();
    await expect(speciesSelect).toContainText('Todas las especies');
  });

  test('should filter animals by species', { tag: [...ANIMAL_FILTER] }, async ({ page }) => {
    await page.goto('/animales');
    await waitForPageLoad(page);

    // Wait for initial animals API load
    await page.waitForResponse((resp) => resp.url().includes('/api/animals') && resp.status() === 200);

    // Target the species select by its unique option content
    const speciesSelect = page.locator('select', { has: page.locator('option', { hasText: 'Todas las especies' }) });
    await expect(speciesSelect).toBeVisible();

    // Use evaluate to change value and dispatch event for React controlled component
    await speciesSelect.evaluate((el) => {
      const select = el as HTMLSelectElement;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(select, 'dog');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Wait for the filtered API call
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/animals') && resp.url().includes('species=dog'),
      { timeout: 10_000 }
    );
  });

  test('should navigate to animal detail from listing', { tag: [...ANIMAL_DETAIL] }, async ({ page }) => {
    await page.goto('/animales');
    await waitForPageLoad(page);

    // quality: allow-fragile-selector (dynamic data: no testid on animal cards, first visible link needed)
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

    // quality: allow-fragile-selector (dynamic data: no testid on animal cards, first visible link needed)
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

    // quality: allow-fragile-selector (dynamic data: no testid on animal cards, first visible link needed)
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

    // quality: allow-fragile-selector (dynamic data: no testid on animal cards, first visible link needed)
    const firstAnimalLink = page.locator('a[href*="/animales/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animales\/\d+/, { timeout: 10_000 });

      // Gallery component should be rendered in the detail page
      // quality: allow-fragile-selector (positional needed: gallery has no testid, first image is sufficient proof)
      await expect(page.locator('img').first()).toBeVisible();
    }
  });
});
