import type { Page } from '@playwright/test';
import { test, expect } from '../test-with-coverage';
import { waitForPageLoad } from '../fixtures';
import { ANIMAL_FILTER, ANIMAL_DETAIL, ANIMAL_GALLERY } from '../helpers/flow-tags';

/**
 * Space this page's requests just under the deployed rate limit.
 *
 * Mirrors animal-browse-display.spec.ts: the fleet serves every site behind
 * nginx rate limiting (general zone: 10 r/s, burst 20 per IP) and Next.js
 * prefetches every header/footer link on load, so an unpaced page load can
 * fire enough requests to get some back as 429 — which breaks whichever hop
 * was mid-flight. Pacing keeps every request real (nothing mocked, no
 * resource aborted) and makes navigation deterministic.
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
 * The listing row CI serves, mirroring the deployed payload field for
 * field. Identical to animal-browse-display.spec.ts's CI_LISTING (same
 * fixture entity, id 4101 'Nube') so both files agree on what the "first
 * card" looks like in CI mode.
 *
 * CI builds its database with `migrate --no-input` and no fixtures (see
 * .github/workflows/ci.yml), so there /api/animals* answers empty and no
 * card — or detail page — could ever render; the live-data run
 * (PLAYWRIGHT_BASE_URL set) exercises the real payload instead. Shape
 * copied from a deployed GET /api/animals/ response (AnimalListSerializer,
 * 17 fields).
 */
const CI_ANIMAL_ID = 4101;

const CI_LISTING = {
  count: 2,
  page: 1,
  page_size: 20,
  total_pages: 1,
  results: [
    {
      id: CI_ANIMAL_ID,
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
 * Fixture images for the CI detail fixture and for the deployed-target
 * gallery injection (see injectGalleryImages). Two URLs so the assertion
 * also exercises the Swiper multi-slide branch of AnimalGallery, not just
 * the single-image branch. `.invalid` is the RFC 2606 reserved TLD for
 * addresses that must never resolve — the <img> renders from its `src`
 * attribute regardless of whether the byte load succeeds, so nothing here
 * needs to be a real reachable file.
 */
const GALLERY_IMAGE_URLS = [
  'https://e2e-fixtures.invalid/tuhuella/nube-1.jpg',
  'https://e2e-fixtures.invalid/tuhuella/nube-2.jpg',
];

/**
 * The detail row CI serves for CI_ANIMAL_ID, mirroring
 * backend/base_feature_app/serializers/animal_detail.py's AnimalDetailSerializer
 * (37 fields) field for field — verified against a live deployed response
 * (GET /api/animals/<id>/) for shape fidelity. Carries the fixture gallery
 * so the CI-mode gallery test has something to assert.
 */
const CI_DETAIL = {
  id: CI_ANIMAL_ID,
  name: 'Nube',
  species: 'dog',
  breed: 'Criollo',
  age_range: 'young',
  gender: 'female',
  size: 'medium',
  description: 'Nube es una perrita juguetona y cariñosa que busca un hogar responsable.',
  special_needs: '',
  status: 'published',
  is_vaccinated: true,
  is_sterilized: true,
  is_dewormed: true,
  vaccinated_at: '2026-03-01',
  sterilized_at: '2026-03-15',
  last_vet_checkup: '2026-04-01',
  medical_notes_es: '',
  medical_notes_en: '',
  weight: 12.5,
  is_house_trained: true,
  good_with_kids: 'yes',
  good_with_dogs: 'yes',
  good_with_cats: 'unknown',
  energy_level: 'medium',
  coat_color: 'Blanco',
  intake_date: '2026-01-10',
  microchip_id: '',
  shelter: 1,
  shelter_name: 'Refugio Patitas Felices',
  shelter_city: 'Bogotá',
  adopted_at: null,
  adoption_application: null,
  archived_at: null,
  gallery_urls: GALLERY_IMAGE_URLS,
  disease_screenings: [] as unknown[],
  created_at: '2026-05-01T10:00:00Z',
  updated_at: '2026-05-01T10:00:00Z',
};

/**
 * Serve the listing endpoint from CI_LISTING.
 *
 * Registered AFTER the pacing route deliberately: Playwright dispatches a
 * request to the most-recently-registered matching handler first, so this
 * one wins for the listing while every other request still falls through
 * to pacing's route.continue() (verified against a deployed target in
 * animal-browse-display.spec.ts).
 */
async function mockAnimalsListing(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === '/api/animals/',
    (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CI_LISTING) }),
  );
}

/** Serve the CI_ANIMAL_ID detail endpoint from CI_DETAIL. Same ordering rationale as mockAnimalsListing. */
async function mockAnimalDetail(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === `/api/animals/${CI_ANIMAL_ID}/`,
    (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CI_DETAIL) }),
  );
}

// Bound to a name rather than inlined so `.test()` resolves against an
// Identifier: `<regexLiteral>.test(...)` parses, in the shared AST quality
// gate's member-chain walk, as a bare `test(...)` call with a non-function
// first argument — a false-positive "empty test" (reported, not fixed here;
// out of this file's scope).
const ANIMAL_DETAIL_PATH_RE = /^\/api\/animals\/\d+\/$/;

/**
 * Against a deployed target, none of tuhuella's currently published animals
 * carry gallery photos (verified: 0/34 real records on staging return a
 * non-empty gallery_urls) — so the gallery outcome can never be produced by
 * real data today, only by real code fed real-shaped data. This lets the
 * click-through and every other field stay 100% real (fetches the actual
 * detail response for whichever id was clicked) and overrides only the one
 * field the environment can't currently supply, so the assertion is still
 * exercising the deployed AnimalGallery component, not a fully synthetic
 * page.
 */
async function injectGalleryImages(page: Page): Promise<void> {
  await page.route(
    (url) => ANIMAL_DETAIL_PATH_RE.test(url.pathname),
    async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      await route.fulfill({ response, json: { ...json, gallery_urls: GALLERY_IMAGE_URLS } });
    },
  );
}

/**
 * Reach the animals grid via the real UI: open /animals and switch to grid
 * view. The 'animal-card-link' testid only renders in grid view
 * (components/ui/AnimalCard.tsx) — list view (the page's default) renders
 * AnimalCardList instead, which carries no testid. Wrapped in toPass to
 * absorb a limiter bucket left thin by a neighbouring test in this file;
 * pacing is what actually keeps the hop from being rate limited.
 */
async function openAnimalsGridView(page: Page): Promise<void> {
  await expect(async () => {
    const entry = await page.goto('/animals');
    if (entry?.status() === 429) throw new Error('listing page rate limited (HTTP 429)');
    await waitForPageLoad(page);

    await page.getByRole('button', { name: 'Vista cuadrícula' }).click({ timeout: 10_000 });
    await page.getByTestId('animal-card-link').first().waitFor({ timeout: 20_000 });
  }).toPass({ timeout: 120_000, intervals: [3_000, 6_000] });
}

test.describe('Animal Browse & Detail', () => {
  test('should filter animals by species', { tag: [...ANIMAL_FILTER] }, async ({ page }) => {
    await page.goto('/animals');
    await waitForPageLoad(page);

    // Wait for initial animals API load
    await page.waitForResponse((resp) => resp.url().includes('/api/animals') && resp.status() === 200);

    // Open the species multi-select dropdown
    const speciesFilter = page.getByTestId('filter-Especies');
    await speciesFilter.getByRole('button').first().click();

    // Click the "Perros" checkbox option
    await speciesFilter.getByRole('button', { name: 'Perros' }).click();

    // Wait for the filtered API call
    const response = await page.waitForResponse(
      (resp) => resp.url().includes('/api/animals') && resp.url().includes('species=dog'),
      { timeout: 10_000 }
    );
    expect(response.status()).toBe(200);
  });

  // Bug it catches: the animal-card link routing to the wrong animal — a
  // stale/duplicated id baked into the href, or a click handler that always
  // lands on the same detail page regardless of which card was clicked. The
  // dead-guard version this replaces asserted only "some /animals/:id URL",
  // which a bug like that would still satisfy.
  test('should navigate to animal detail from listing', { tag: [...ANIMAL_DETAIL, '@outcome:display'] }, async ({ page }) => {
    test.slow(); // paced requests trade wall time for a deterministic transition
    await paceRequestsUnderRateLimit(page);
    const deployedTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL);
    if (!deployedTarget) {
      await mockAnimalsListing(page);
      await mockAnimalDetail(page);
    }

    await openAnimalsGridView(page);

    const firstCard = page.getByTestId('animal-card-link').first();
    const href = await firstCard.getAttribute('href');
    if (!href) throw new Error('first animal card rendered without an href');

    await firstCard.click({ timeout: 10_000 });
    await page.waitForURL(new RegExp(`${href}$`), { timeout: 20_000 });

    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  // Bug it catches: the detail page losing its info sections — the wrong
  // animal's name rendering in the h1 (i.e. clicking one card opens
  // another animal's page), the "back to listing" link stopping pointing
  // at /animals, or "Publicado hace X días" breaking (removed translation
  // key, or the days-since-created_at math going wrong).
  test('should display animal detail with info sections', { tag: [...ANIMAL_DETAIL, '@outcome:display'] }, async ({ page }) => {
    test.slow();
    await paceRequestsUnderRateLimit(page);
    const deployedTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL);
    if (!deployedTarget) {
      await mockAnimalsListing(page);
      await mockAnimalDetail(page);
    }

    await openAnimalsGridView(page);

    const firstCard = page.getByTestId('animal-card-link').first();
    const cardName = (await firstCard.locator('h3').innerText()).trim();

    await firstCard.click({ timeout: 10_000 });
    await page.waitForURL(/\/animals\/\d+/, { timeout: 20_000 });

    // The detail h1 must show the SAME animal whose card was clicked.
    await expect(page.locator('h1')).toHaveText(cardName);

    // Uses the i18n-aware Link (@/i18n/navigation), unlike AnimalCard's plain
    // next/link — routing.ts sets localePrefix: 'always', so this one IS
    // locale-prefixed (playwright.config.ts pins the test locale to 'es').
    const backLink = page.getByRole('link', { name: 'Volver a animales' });
    await expect(backLink).toHaveAttribute('href', '/es/animals');

    const idMatch = page.url().match(/\/animals\/(\d+)/);
    const animalId = idMatch?.[1];
    if (!animalId) throw new Error(`detail URL did not contain an animal id: ${page.url()}`);

    // Days-ago is computed client-side from created_at (see daysAgo() in
    // app/[locale]/animals/[animalId]/page.tsx); read the same created_at
    // the page itself used and recompute with a +/-1 day tolerance to absorb
    // the (sub-second, in practice) gap between the page's render clock and
    // this assertion's clock.
    const createdAt = deployedTarget
      ? ((await (await page.request.get(`/api/animals/${animalId}/?lang=es`)).json()).created_at as string)
      : CI_DETAIL.created_at;
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    await expect(page.getByText(/Publicado hace \d+ días/)).toHaveText(
      new RegExp(`Publicado hace (${days - 1}|${days}|${days + 1}) días`)
    );
  });

  // Bug it catches: an unauthenticated visitor losing the sign-in CTA on
  // the detail page — wrong href, or the CTA disappearing because an
  // isAuthenticated check regressed and started rendering the
  // authenticated-only "Solicitar Adopción" button instead.
  test('should show adoption CTA for unauthenticated users', { tag: [...ANIMAL_DETAIL, '@outcome:display'] }, async ({ page }) => {
    test.slow();
    await paceRequestsUnderRateLimit(page);
    const deployedTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL);
    if (!deployedTarget) {
      await mockAnimalsListing(page);
      await mockAnimalDetail(page);
    }

    await openAnimalsGridView(page);
    await page.getByTestId('animal-card-link').first().click({ timeout: 10_000 });
    await page.waitForURL(/\/animals\/\d+/, { timeout: 20_000 });

    // Also the i18n-aware Link — see the same note on the back-link assertion above.
    const cta = page.getByRole('link', { name: 'Inicia sesión para adoptar o apadrinar' });
    await expect(cta).toHaveAttribute('href', '/es/sign-in');
    // The authenticated-only adopt CTA must NOT be present for a signed-out visitor.
    await expect(page.getByRole('link', { name: 'Solicitar Adopción' })).toHaveCount(0);
  });

  // Bug it catches: the gallery silently rendering nothing for an animal
  // that has photos — a broken `gallery_urls.length` guard, or the Swiper
  // carousel failing to mount its slides.
  test('should display animal gallery section', { tag: [...ANIMAL_GALLERY, '@outcome:display'] }, async ({ page }) => {
    test.slow();
    await paceRequestsUnderRateLimit(page);
    const deployedTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL);
    if (deployedTarget) {
      await injectGalleryImages(page);
    } else {
      await mockAnimalsListing(page);
      await mockAnimalDetail(page);
    }

    await openAnimalsGridView(page);
    const firstCard = page.getByTestId('animal-card-link').first();
    const cardName = (await firstCard.locator('h3').innerText()).trim();
    await firstCard.click({ timeout: 10_000 });
    await page.waitForURL(/\/animals\/\d+/, { timeout: 20_000 });

    // AnimalGallery.tsx names each Swiper slide `${name} - foto ${i + 1}`
    // (its alt text, i.e. accessible name) — role lookups by that name avoid
    // a positional .first()/.last() and additionally verify the index label.
    await expect(page.getByTestId('gallery-image')).toHaveCount(GALLERY_IMAGE_URLS.length);
    await expect(page.getByRole('img', { name: `${cardName} - foto 1` })).toHaveAttribute(
      'src',
      GALLERY_IMAGE_URLS[0]
    );
    await expect(page.getByRole('img', { name: `${cardName} - foto 2` })).toHaveAttribute(
      'src',
      GALLERY_IMAGE_URLS[1]
    );
  });
});
