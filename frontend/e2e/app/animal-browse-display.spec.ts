import type { Page } from '@playwright/test';
import { test, expect } from '../test-with-coverage';
import { ANIMAL_BROWSE } from '../helpers/flow-tags';

type ListedAnimal = { id: number; name: string };

/**
 * Space this page's requests just under the deployed rate limit.
 *
 * The fleet serves every site behind nginx rate limiting (general zone: 10 r/s,
 * burst 20 per IP) and Next.js prefetches every header/footer link on load, so an
 * unpaced page load fires ~40 requests in about a second. The excess comes back 429,
 * the RSC payload for a nav click dies with it, Next falls back to a hard navigation
 * that is limited too, and nginx's "429 Too Many Requests" page replaces the app —
 * which is exactly how this spec first failed. Pacing keeps every hop real (nothing
 * mocked, no resource aborted) and makes the navigation deterministic instead of
 * luck-of-the-burst: measured 0 rate-limited responses across back-to-back runs.
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

test.describe('Animal browse — display via UI navigation', () => {
  // Bug it catches: the header route to the listing breaking (renamed route,
  // locale prefix regression) or the listing rendering without its data grid —
  // the deep-link junk spec this replaces could not see either.
  test('user reaches the animal listing from the home nav and sees the cards grid', { tag: [...ANIMAL_BROWSE, '@outcome:display'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);

    let expected: ListedAnimal | undefined;

    // Retried only to absorb a limiter bucket left empty by a neighbouring spec:
    // pacing alone is what keeps the hop from being rate limited.
    await expect(async () => {
      const entry = await page.goto('/');
      if (entry?.status() === 429) throw new Error('entry document rate limited (HTTP 429)');
      await page.waitForLoadState('networkidle');

      await page.locator('header').getByRole('link', { name: 'Animales' }).click({ timeout: 10_000 });
      await page.waitForURL(/\/animals/, { timeout: 20_000 });

      // The listing defaults to list view; the cards grid is behind the view toggle.
      await page.getByRole('button', { name: 'Vista cuadrícula' }).click({ timeout: 10_000 });
      await page.getByTestId('animal-card-link').first().waitFor({ timeout: 20_000 });

      // Expected values come from the endpoint the page itself reads, so they cannot
      // rot as content changes; the listing order is server-side and deterministic.
      const listing = await page.request.get('/api/animals/?lang=es');
      const [first] = ((await listing.json()).results ?? []) as ListedAnimal[];
      if (!first) throw new Error(`animals API returned no rows (HTTP ${listing.status()})`);
      expected = first;
    }).toPass({ timeout: 120_000, intervals: [3_000, 6_000] });

    await expect(page).toHaveURL(/\/es\/animals$/);
    await expect(page.locator('h1')).toHaveText('Animales en adopción');

    const firstCard = page.getByTestId('animal-card-link').first();
    await expect(firstCard).toHaveAttribute('href', `/animals/${expected!.id}`);
    await expect(firstCard).toContainText(expected!.name);
  });
});
