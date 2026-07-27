import type { Page } from '@playwright/test';
import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { CAMPAIGN_BROWSE, CAMPAIGN_DETAIL, CAMPAIGN_TAB_TOGGLE, CAMPAIGN_DONATE_CTA, CAMPAIGN_UPDATES_FEED } from '../helpers/flow-tags';
import { mockCampaignDetail } from '../helpers/mock-data';

/**
 * Space this page's requests just under the deployed rate limit.
 *
 * Mirrors animal-browse-display.spec.ts's pacing helper: the fleet serves every
 * site behind nginx rate limiting and Next.js prefetches every header/footer
 * link on load, so an unpaced home-page hop can come back 429 before the click
 * even lands. See that file for the full measured rationale.
 */
async function paceRequestsUnderRateLimit(page: Page, minGapMs = 110): Promise<void> {
  let nextAt = 0;
  await page.route('**/*', async (route) => {
    const now = Date.now();
    const at = Math.max(now, nextAt);
    nextAt = at + minGapMs;
    const delay = at - now;
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    await route.continue();
  });
}

/**
 * CI builds its database with `migrate --no-input` and no fixtures, so there the
 * real /campaigns/ endpoint answers an empty list. Mocked only off a deployed
 * target, and registered AFTER pacing so it wins for the campaigns endpoint
 * while every other request still falls through to pacing (same reverse-
 * registration convention as animal-browse-display.spec.ts).
 */
async function mockCampaignsListingCI(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === '/api/campaigns/',
    (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  );
}

test.describe('Campaign Browse & Detail', () => {
  // Bug it catches: the header route to the campaigns listing breaking (renamed
  // route, locale-prefix regression) or the page rendering without its heading —
  // the deep-link `goto('/campaigns')` + URL-only assertion this replaces could
  // not see either.
  test('should display campaigns listing page', { tag: [...CAMPAIGN_BROWSE, '@outcome:display'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);

    const deployedTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL);
    if (!deployedTarget) await mockCampaignsListingCI(page);

    await expect(async () => {
      const entry = await page.goto('/');
      if (entry?.status() === 429) throw new Error('entry document rate limited (HTTP 429)');
      await page.locator('header').getByRole('link', { name: 'Campañas' }).click({ timeout: 10_000 });
      await page.waitForURL(/\/campaigns$/, { timeout: 20_000 });
    }).toPass({ timeout: 120_000, intervals: [3_000, 6_000] });

    await expect(page.getByRole('heading', { name: /Campañas activas/i })).toBeVisible({ timeout: 15_000 });
  });

  test('should navigate to campaign detail from listing', { tag: [...CAMPAIGN_DETAIL] }, async ({ page }) => {
    await page.goto('/campaigns');
    await waitForPageLoad(page);

    const campaignLink = page.getByRole('link').filter({ has: page.getByRole('heading') }).first();
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

    const campaignLink = page.getByRole('link').filter({ has: page.getByRole('heading') }).first();
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

test.describe('Campaign Updates Feed', () => {
  test('reads the progress-updates feed on a completed campaign', { tag: [...CAMPAIGN_UPDATES_FEED, '@outcome:display'] }, async ({ page }) => {
    // quality: allow-no-interaction (display outcome: feed content asserted with concrete mocked values; the feed has no interactive surface)
    // quality: allow-deep-link (campaign-detail's click test owns UI navigation into a campaign; this spec needs a specific completed campaign with seeded updates)
    // Updates feed renders only when campaign.status === 'completed'.
    await page.route('**/api/campaigns/3/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockCampaignDetail, status: 'completed' }),
      }),
    );
    await page.route('**/api/updates/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, title: 'Meta alcanzada: 20 esterilizaciones', image_url: null, shelter_name: 'Refugio E2E', created_at: '2026-05-01T10:00:00Z' },
        ]),
      }),
    );
    // FAQ lookups on the detail page are best-effort; stub to keep the network quiet.
    await page.route('**/api/faqs/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await page.goto('/campaigns/3');
    await waitForPageLoad(page);

    await expect(page.getByRole('heading', { name: /Actualizaciones y evidencias/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /Meta alcanzada: 20 esterilizaciones/i })).toBeVisible({ timeout: 10_000 });
  });
});
