# E2E Tests — Playwright + Flow Coverage

End-to-end tests organized by module with **Flow Coverage** tracking.

## Structure

```
e2e/
├── flow-definitions.json          # All user flows (source of truth)
├── reporters/
│   └── flow-coverage-reporter.mjs # Custom reporter
├── helpers/
│   └── flow-tags.ts               # Tag constants per flow
├── fixtures.ts                    # Shared fixtures + helpers
├── test-with-coverage.ts          # Shared test base
├── auth/                          # Auth module specs
│   └── auth.spec.ts
├── app/                           # App flows (cart/checkout/purchase)
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   ├── complete-purchase.spec.ts
│   └── user-flows.spec.ts
├── public/                        # Public pages (blogs/catalog/navigation)
│   ├── blogs.spec.ts
│   ├── navigation.spec.ts
│   ├── products.spec.ts
│   └── smoke.spec.ts
└── README.md
```

## Artifacts (generated)

These directories are generated after runs and are gitignored:

- `playwright-report/` — HTML report
- `e2e-results/` — `flow-coverage.json` and `results.json`
- `test-results/` — traces/attachments (only on retries)

## Running Tests

```bash
# All tests (Flow Coverage + HTML + JSON reports)
npm run e2e

# Alias
npm run test:e2e

# Alias used by coverage workflows
npm run e2e:coverage

# Clean Playwright reports/traces then run
npm run e2e:clean && npm run e2e

# Interactive UI / headed / debug
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:debug

# Run by device project
npm run e2e:desktop
npm run e2e:mobile
npm run e2e:tablet

# List available modules (from flow-definitions.json)
npm run e2e:modules

# Run tests for a single module
npm run e2e:module -- auth

# Module-scoped coverage run
clear && npm run e2e:clean && npm run e2e:coverage -- --grep @module:auth
npm run e2e:coverage:module -- auth

# Single module
npx playwright test e2e/auth/

# Filter by flow tag or metadata tags
npx playwright test --grep @flow:catalog-browse
npx playwright test --grep @module:auth
npx playwright test --grep @priority:P1

# Single file
npx playwright test e2e/app/cart.spec.ts

# View report
npx playwright show-report
```

> `--grep @module:<name>` runs only tests tagged with that module. The flow coverage report will still list other modules as missing because the subset was not executed.

## Local web servers (automatic)

Playwright starts (or reuses) the following servers from `playwright.config.ts`:

- Backend: `127.0.0.1:8000` (health check: `/api/blogs-data/`)
- Frontend: `http://localhost:3000` (Next.js dev server)

If the servers are already running, `reuseExistingServer: true` is used when not in CI.
`baseURL` defaults to `http://localhost:3000` and can be overridden with `PLAYWRIGHT_BASE_URL`.

## Flow Coverage System

Every test is tagged with `@flow:<flow-id>` linking it to a flow definition in `flow-definitions.json`.
The custom reporter tracks coverage at the user-journey level. Flow tag constants include
`@flow:`, `@module:`, and `@priority:` values for consistent filtering.

### Tagging tests

```typescript
import { test, expect } from '../test-with-coverage';
import { AUTH_SIGN_IN_FORM } from '../helpers/flow-tags';

test('sign-in form is visible', {
  tag: [...AUTH_SIGN_IN_FORM, '@role:shared'],
}, async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByPlaceholder('Email')).toBeVisible();
});
```

### Flow Coverage Report

Example output (values vary per run):

```
╔══════════════════════════════════════════════════════════════════╗
║                    FLOW COVERAGE REPORT                         ║
╚══════════════════════════════════════════════════════════════════╝
📊 SUMMARY
   Total Flows Defined:  33
   ✅ Covered:           30 (90.9%)
   ⚠️  Partial:           2 (6.1%)
📦 COVERAGE BY MODULE
   auth     [████████████████████] 100% (5/5)
   cart     [███████████████░░░░░] 71% (5/7)
   ...
```

JSON artifacts:

- `e2e-results/flow-coverage.json`
- `e2e-results/results.json`

### Adding a new flow

1. Add entry to `e2e/flow-definitions.json` (update `lastUpdated`).
2. Add constant to `e2e/helpers/flow-tags.ts`.
3. Tag the spec file with `@flow:<flow-id>`.
4. Run E2E tests and verify the flow appears as `covered`.

## Helpers

| Helper | File | Purpose |
|--------|------|---------|
| `waitForPageLoad(page)` | `fixtures.ts` | Wait for `load` + `domcontentloaded` |
| `waitForApiResponse(page, url)` | `fixtures.ts` | Wait for a 200 response that matches a URL |
| `testAdopter`, `testShelterAdmin`, `testPlatformAdmin`, `testDonationData`, `testSponsorshipData` | `fixtures.ts` | Shared fixture data |
| `test` / `expect` | `test-with-coverage.ts` | Shared Playwright test base |
| Flow tag constants | `helpers/flow-tags.ts` | Tag arrays per flow/module/priority |

## Flow Definitions (48 flows)

Source of truth: `e2e/flow-definitions.json` (update `lastUpdated` when adding flows).

| Module | Flows | Priority |
|--------|-------|----------|
| **home** | home-loads, home-to-animals, home-to-shelters, home-to-campaigns | P1-P3 |
| **auth** | auth-sign-in-form, auth-login-invalid, auth-sign-up-form, auth-forgot-password-form, auth-protected-redirect, auth-role-redirect, auth-sign-out, auth-session-persistence, auth-google-login | P1-P2 |
| **animal** | animal-browse, animal-filter, animal-detail, animal-gallery | P1-P3 |
| **shelter** | shelter-browse, shelter-detail, shelter-onboarding | P1-P2 |
| **adoption** | adoption-submit, adoption-track, adoption-manage | P1-P2 |
| **campaign** | campaign-browse, campaign-detail | P2 |
| **donation** | donation-checkout, donation-history, payment-confirmation | P1-P2 |
| **sponsorship** | sponsorship-checkout, sponsorship-history | P1-P2 |
| **favorite** | favorite-toggle, favorite-list | P2 |
| **adopter-intent** | adopter-intent-create, adopter-intent-browse | P3 |
| **adopter** | adopter-profile | P2 |
| **public** | public-faq | P4 |
| **shelter-panel** | shelter-panel-dashboard, shelter-panel-animals, shelter-panel-campaigns, shelter-panel-donations, shelter-panel-settings | P1-P2 |
| **admin** | admin-dashboard, admin-approve-shelters, admin-moderation, admin-metrics, admin-payments | P1-P2 |
| **navigation** | navigation-header, navigation-footer, navigation-between-pages | P2-P4 |

## References

- [Playwright Docs](https://playwright.dev/)
- [E2E Flow Coverage Report Standard](../../docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md)
- [Architecture Standard — E2E sections](../../docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md)
