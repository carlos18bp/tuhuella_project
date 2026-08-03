import type { Page } from '@playwright/test';

/**
 * Space a spec's requests just under the deployed rate limit.
 *
 * The fleet serves every site behind nginx rate limiting (general zone: 10 r/s,
 * burst 20 per IP) and Next.js prefetches every header/footer link on load, so an
 * unpaced page load fires ~40 requests in about a second. The excess comes back 429,
 * the RSC payload for a nav click dies with it, Next falls back to a hard navigation
 * that is limited too, and nginx's "429 Too Many Requests" page replaces the app —
 * which is exactly how the animal-browse spec first failed. Pacing keeps every hop
 * real (nothing mocked, no resource aborted) and makes the navigation deterministic
 * instead of luck-of-the-burst: measured 0 rate-limited responses across back-to-back
 * runs.
 *
 * ORDERING CONTRACT — register this BEFORE any endpoint mock the test relies on.
 * Playwright matches route handlers in reverse registration order and this one calls
 * `route.continue()`, so a `page.route('**\/api/x/**', fulfill)` registered EARLIER
 * would never be reached: the catch-all would send the request to the network instead.
 * Register pacing first (top of the test body, or the first line of the describe's
 * beforeEach) and every specific mock after it — then the mocks win for their own
 * paths and everything else falls through to pacing.
 */
export async function paceRequestsUnderRateLimit(page: Page, minGapMs = 110): Promise<void> {
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
