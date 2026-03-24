import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { CAMPAIGN_BROWSE, CAMPAIGN_DETAIL } from '../helpers/flow-tags';

test.describe('Campaign Browse & Detail', () => {
  test('should display campaigns listing page', { tag: [...CAMPAIGN_BROWSE] }, async ({ page }) => {
    await page.goto('/campaigns');
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*campanas/);
  });

  test('should navigate to campaign detail from listing', { tag: [...CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.goto('/campaigns');
    await waitForPageLoad(page);

    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    if (await campaignLink.isVisible({ timeout: 5000 })) {
      await campaignLink.click();
      await page.waitForURL(/.*campanas\/\d+/, { timeout: 10_000 });

      await expect(page).toHaveURL(/.*campanas\/\d+/);
    }
  });
});
