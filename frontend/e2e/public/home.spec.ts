import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { HOME_FEATURED_ANIMALS_CAROUSEL, HOME_ACTIVE_CAMPAIGNS_CAROUSEL } from '../helpers/flow-tags';

test.describe('Home Page — Featured Animals Carousel @flow:home-featured-animals-carousel', () => {
  test('should display featured animals section with carousel navigation', { tag: [...HOME_FEATURED_ANIMALS_CAROUSEL] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Animales en busca de hogar/i })).toBeVisible();

    // quality: allow-fragile-selector
    const nextButton = page.locator('.swiper-button-next').first();
    await expect(nextButton).toBeAttached();

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
  });
});

test.describe('Home Page — Active Campaigns Carousel @flow:home-active-campaigns-carousel', () => {
  test('should display active campaigns section with carousel navigation', { tag: [...HOME_ACTIVE_CAMPAIGNS_CAROUSEL] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Campañas activas/i })).toBeVisible();

    // quality: allow-fragile-selector
    const nextButton = page.locator('.swiper-button-next').nth(1);
    await expect(nextButton).toBeAttached();

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
  });
});
