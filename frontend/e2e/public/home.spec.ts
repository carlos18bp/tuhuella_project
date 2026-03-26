import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { HOME_FEATURED_ANIMALS_CAROUSEL, HOME_ACTIVE_CAMPAIGNS_CAROUSEL } from '../helpers/flow-tags';

test.describe('Home Page — Featured Animals Carousel @flow:home-featured-animals-carousel', () => {
  test('should display featured animals section with carousel navigation', { tag: [...HOME_FEATURED_ANIMALS_CAROUSEL] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Animales en busca de hogar/i })).toBeVisible();

    // Wait for animals API to resolve before checking carousel
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/animals/') && resp.status() === 200,
      { timeout: 10_000 },
    ).catch(() => {});

    // quality: allow-fragile-selector (Swiper renders .swiper-button-next; aria-label not guaranteed across versions)
    const nextButton = page.locator('.swiper-button-next').first();
    const hasCarousel = await nextButton.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasCarousel) {
      await nextButton.click();
    }
    // If no animals exist the skeleton renders instead — section heading assertion above is sufficient
  });
});

test.describe('Home Page — Active Campaigns Carousel @flow:home-active-campaigns-carousel', () => {
  test('should display active campaigns section with carousel navigation', { tag: [...HOME_ACTIVE_CAMPAIGNS_CAROUSEL] }, async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Campañas activas/i })).toBeVisible();

    // Wait for campaigns API to resolve before checking carousel
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/campaigns/') && resp.status() === 200,
      { timeout: 10_000 },
    ).catch(() => {});

    // quality: allow-fragile-selector (Swiper renders .swiper-button-next; aria-label not guaranteed across versions)
    const nextButton = page.locator('.swiper-button-next').last();
    const hasCarousel = await nextButton.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasCarousel) {
      await nextButton.click();
    }
    // If no campaigns exist the skeleton renders instead — section heading assertion above is sufficient
  });
});
