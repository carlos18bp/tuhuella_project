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

/**
 * The listing rows CI serves, mirroring the deployed payload field for field.
 *
 * CI builds its database with `migrate --no-input` and no fixtures (see
 * .github/workflows/ci.yml), so there the real endpoint answers
 * `{count: 0, results: []}` and no card can ever render — the live-data run
 * (PLAYWRIGHT_BASE_URL set) is what exercises the real payload. Shape copied
 * from a deployed GET /api/animals/ response (AnimalListSerializer, 17 fields)
 * so the fixture cannot drift into asserting something the API never sends.
 * Two rows keep the leading-card assertions meaningful: a grid that lost the
 * payload's order fails them instead of matching whichever card it likes.
 */
const CI_LISTING = {
  count: 2,
  page: 1,
  page_size: 20,
  total_pages: 1,
  results: [
    {
      id: 4101,
      name: 'Nube',
      species: 'dog',
      breed: 'Criollo',
      age_range: 'young',
      gender: 'female',
      size: 'medium',
      status: 'published',
      is_vaccinated: true,
      is_sterilized: true,
      energy_level: 'medium',
      good_with_kids: 'yes',
      good_with_dogs: 'yes',
      good_with_cats: 'unknown',
      shelter: 1,
      shelter_name: 'Refugio Patitas Felices',
      created_at: '2026-05-01T10:00:00Z',
    },
    {
      id: 4102,
      name: 'Trueno',
      species: 'cat',
      breed: 'Criollo',
      age_range: 'adult',
      gender: 'male',
      size: 'small',
      status: 'published',
      is_vaccinated: false,
      is_sterilized: false,
      energy_level: 'low',
      good_with_kids: 'unknown',
      good_with_dogs: 'unknown',
      good_with_cats: 'yes',
      shelter: 1,
      shelter_name: 'Refugio Patitas Felices',
      created_at: '2026-04-01T10:00:00Z',
    },
  ],
};

/**
 * Serve the listing endpoint from CI_LISTING.
 *
 * Registered AFTER the pacing route deliberately: Playwright matches handlers in
 * reverse registration order, so this one wins for the listing while every other
 * request still falls through to pacing (verified against a deployed target).
 */
async function mockAnimalsListing(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === '/api/animals/',
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CI_LISTING),
      }),
  );
}

test.describe('Animal browse — display via UI navigation', () => {
  // Bug it catches: the header route to the listing breaking (renamed route,
  // locale prefix regression) or the listing rendering without its data grid —
  // the deep-link junk spec this replaces could not see either.
  test('user reaches the animal listing from the home nav and sees the cards grid', { tag: [...ANIMAL_BROWSE, '@outcome:display'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);

    // Against a deployed target the real payload IS the point of this spec; on
    // CI's empty database the rows come from the fixture instead, the repo's
    // convention for data-dependent e2e (see campaign.spec.ts).
    const deployedTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL);
    if (!deployedTarget) await mockAnimalsListing(page);

    let expected: ListedAnimal | undefined = deployedTarget ? undefined : CI_LISTING.results[0];

    // Retried only to absorb a limiter bucket left empty by a neighbouring spec:
    // pacing alone is what keeps the hop from being rate limited.
    await expect(async () => {
      const entry = await page.goto('/');
      if (entry?.status() === 429) throw new Error('entry document rate limited (HTTP 429)');
      // goto already waits for 'load'; the paced click below carries its own
      // timeout — networkidle is banned by the repo's eslint-playwright config.
      await page.locator('header').getByRole('link', { name: 'Animales' }).click({ timeout: 10_000 });
      await page.waitForURL(/\/animals/, { timeout: 20_000 });

      // The listing defaults to list view; the cards grid is behind the view toggle.
      await page.getByRole('button', { name: 'Vista cuadrícula' }).click({ timeout: 10_000 });
      await page.getByTestId('animal-card-link').first().waitFor({ timeout: 20_000 });

      if (!deployedTarget) return; // fixture rows already pinned above

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
