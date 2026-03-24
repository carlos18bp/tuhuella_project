import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { ADOPTION_SUBMIT, ADOPTION_TRACK, ADOPTION_MANAGE } from '../helpers/flow-tags';

test.describe('Adoption Flows', () => {
  test('should redirect unauthenticated user from adoption tracking', { tag: [...ADOPTION_TRACK] }, async ({ page }) => {
    await page.goto('/my-applications');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|mis-solicitudes/);
  });

  test('should show adoption CTA on animal detail for unauthenticated user', { tag: [...ADOPTION_SUBMIT] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    const firstAnimalLink = page.locator('a[href*="/animals/"]').first();
    if (await firstAnimalLink.isVisible({ timeout: 5000 })) {
      await firstAnimalLink.click();
      await page.waitForURL(/.*animales\/\d+/, { timeout: 10_000 });

      await expect(page.getByRole('link', { name: /Inicia sesión para adoptar/i })).toBeVisible();
    }
  });

  test('should redirect unauthenticated user from shelter applications', { tag: [...ADOPTION_MANAGE] }, async ({ page }) => {
    await page.goto('/shelter/solicitudes');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/sign-in|solicitudes/);
  });
});
