import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { CAMPAIGN_BROWSE, CAMPAIGN_DETAIL, CAMPAIGN_TAB_TOGGLE, CAMPAIGN_DONATE_CTA } from '../helpers/flow-tags';

test.describe('Campaign Browse & Detail', () => {
  test('should display campaigns listing page', { tag: [...CAMPAIGN_BROWSE] }, async ({ page }) => {
    await page.goto('/campaigns');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*campaigns/);
  });

  test('should navigate to campaign detail from listing', { tag: [...CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.goto('/campaigns');
    await waitForPageLoad(page);

    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    if (await campaignLink.isVisible({ timeout: 5000 })) {
      await campaignLink.click();
      await page.waitForURL(/.*campaigns\/\d+/, { timeout: 10_000 });

      await expect(page).toHaveURL(/.*campaigns\/\d+/);
    }
  });

  test('should toggle between active and completed campaign tabs', { tag: [...CAMPAIGN_TAB_TOGGLE] }, async ({ page }) => {
    await page.goto('/campaigns');
    await waitForPageLoad(page);

    // Verify both tabs are visible (Spanish: "Activas" and "Completadas")
    const activeTab = page.getByRole('button', { name: /Activas/i });
    const completedTab = page.getByRole('button', { name: /Completadas/i });

    await expect(activeTab).toBeVisible();
    await expect(completedTab).toBeVisible();

    // Click the Completed tab
    await completedTab.click();

    // Verify the completed tab is now visually selected (has active styling)
    await expect(completedTab).toHaveClass(/text-amber-700/);
  });

  test('should show donate CTA on campaign detail page', { tag: [...CAMPAIGN_DONATE_CTA] }, async ({ page }) => {
    await page.goto('/campaigns');
    await waitForPageLoad(page);

    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    if (await campaignLink.isVisible({ timeout: 5000 })) {
      await campaignLink.click();
      await page.waitForURL(/.*campaigns\/\d+/, { timeout: 10_000 });

      // The CTA is either "Donar a esta campaña" (authenticated) or "Inicia sesión para donar" (unauthenticated)
      const donateCta = page.getByRole('link', { name: /Donar a esta campaña|Inicia sesión para donar/i });
      await expect(donateCta).toBeVisible({ timeout: 10_000 });

      await donateCta.click();

      // Should redirect to either donation checkout or sign-in page
      await page.waitForURL(/.*(?:checkout\/donation|sign-in)/, { timeout: 10_000 });
      await expect(page).toHaveURL(/.*(?:checkout\/donation|sign-in)/);
    }
  });
});
