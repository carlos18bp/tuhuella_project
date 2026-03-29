---
trigger: manual
description: Project intelligence and lessons learned. Reference for project-specific patterns, preferences, and key insights discovered during development.
---

# Lessons Learned — Mi Huella

> Last updated: 2026-03-29

This file captures important patterns, preferences, and project intelligence that help work more effectively with this codebase. Updated as new insights are discovered.

---

## 1. Architecture Patterns

### Single Django App: `base_feature_app`
- All 24 model classes (21 files), views, serializers, and services live in `base_feature_app`
- App name kept from template to avoid migration headaches
- Models split into individual files under `base_feature_app/models/`
- URLs split into 20 sub-modules under `base_feature_app/urls/`

### Role-Based Access
- Three roles: `adopter` (default), `shelter_admin`, `admin`
- Queryset filtering in views enforces object-level authorization
- Shelter ownership verified via `user.shelters.filter(pk=...)` pattern

### Structured JSON for Forms
- `AdoptionApplication.form_answers` uses `JSONField` for flexible adoption questionnaires
- `AdopterIntent.preferences` uses `JSONField` for species/size/age preferences
- This avoids rigid schema changes when form questions evolve

### Image Handling
- `django-attachments` provides `SingleImageField` and `GalleryField`
- `Animal.gallery` uses `GalleryField` → serialized as `gallery_urls: string[]`
- `Shelter.logo`, `Shelter.cover_image`, `Campaign.cover_image` use `SingleImageField`
- `Campaign.evidence_gallery` uses `GalleryField` for completed campaign evidence photos
- `django-cleanup` auto-deletes orphaned files on model delete

### Email Architecture
- All email functions centralized in `utils/email_utils.py` (single source of truth)
- `services/email_service.py` provides `EmailService` class that delegates to `email_utils`
- `utils/auth_utils.py` has backwards-compatible re-exports (`from email_utils import ...`)
- All emails use branded HTML templates (table-based for email client compatibility) + plain text fallback
- Templates use Django template inheritance: `emails/base_email.html` → specific templates
- Team notifications go to `TEAM_EMAIL = 'team@proyectapps.co'`

### Notification Model Split
- Implementation uses `NotificationPreference` + `NotificationLog` (two models)
- Separates user configuration from delivery records
- Notification service + templates in separate service files

---

## 2. Code Style & Conventions

### Backend: Function-Based Views (FBV)
- **All** DRF views use `@api_view` decorators, not class-based views
- Never convert to CBV unless explicitly requested
- Each domain has its own view module: `views/animal.py`, `views/shelter.py`, etc.

### Frontend: Zustand Stores
- **10** Zustand stores with TypeScript types
- Stores: `authStore`, `animalStore`, `shelterStore`, `campaignStore`, `donationStore`, `sponsorshipStore`, `favoriteStore`, `adoptionStore`, `blogStore`, `notificationStore`
- HTTP requests go through centralized `lib/services/http.ts` Axios instance
- Token management via `lib/services/tokens.ts` + `js-cookie`

### i18n Pattern (next-intl)
- Locale stored in Zustand with `persist` middleware (cookie)
- `i18n/request.ts` reads locale from cookie on server side
- Translation files: `messages/en.json`, `messages/es.json`
- No URL prefix approach — single URL set for all locales

### Naming Conventions
- Backend: snake_case for everything (Python standard)
- Frontend stores: camelCase file names (`animalStore.ts`)
- Frontend components: PascalCase (`AnimalCard.tsx`, `ShelterCard.tsx`)
- Frontend hooks: camelCase with `use` prefix (`useScrollReveal.ts`, `useRequireAuth.ts`, `useFAQs.ts`)
- Types: PascalCase in `lib/types.ts` (`Animal`, `Shelter`, `Campaign`)
- Routes: SCREAMING_SNAKE in `lib/constants.ts` (`ROUTES.ANIMALS`, `ROUTES.SHELTER_DETAIL(id)`)

---

## 3. Development Workflow

### Backend Commands Always Need venv
```bash
source venv/bin/activate && <command>
```

### Frontend Dev Proxy
- Next.js rewrites `/api/:path*` → Django at `localhost:8000`
- Also rewrites `/media/:path*` for uploaded images
- Both servers must be running simultaneously for full functionality

### Test Execution Rules
- Never run the full test suite — always specify files
- Backend: `pytest base_feature_app/tests/<specific_file> -v`
- Frontend: `npm test -- <specific_file>`
- E2E: `npx playwright test e2e/<specific_file>.spec.ts`
- Max 20 tests or 3 commands per execution cycle

### Fake Data Commands
- 21 management commands create realistic test data (one per model + orchestrator + delete)
- Run in dependency order via `python manage.py create_fake_data`
- Delete all via `python manage.py delete_fake_data` (preserves superusers)
- `seed_amount_options` seeds predefined donation/sponsorship amounts
- Uses Faker for realistic names, descriptions, etc.

---

## 4. Frontend Design System

### Color Palette
- **Base**: Stone (50–900) — backgrounds, text, borders
- **Primary**: Teal (500–700) — CTAs, links, hover states
- **Accent**: Amber (500–700) — campaigns, donations, warnings
- **Success**: Emerald (50–700) — badges (vaccinated, verified, sterilized)
- **Error**: Red (50–500) — favorites heart, error states

### Animation Libraries
- **GSAP + ScrollTrigger**: Scroll-reveal animations via `useScrollReveal` hook (dynamic import to avoid SSR issues)
- **Swiper**: Image carousels via `AnimalGallery` and `ShelterGallery` components
- **Framer Motion**: Page transitions via `app/template.tsx`

### Shared Components (`components/ui/` — 31 components)
- `AnimalCard`, `AnimalGrid`, `AnimalFilters`, `AnimalGallery` — animal browsing
- `ShelterCard`, `ShelterProfile`, `ShelterGallery` — shelter display
- `CampaignCard` — campaign card with progress bar
- `AdoptionForm`, `ApplicationStatusBadge`, `ApplicationTimeline` — adoption workflow
- `CheckoutForm`, `DonationForm`, `PaymentMethodSelector`, `PaymentConfirmation` — payment flow
- `Hero`, `CTASection`, `HowItWorks`, `StatsCounter` — landing page sections
- `FAQAccordion`, `MultiSelectDropdown`, `StatusBadge`, `VerifiedBadge`, `ProgressBar` — utility
- `EmptyState`, `LoadingSpinner` — states

---

## 5. Testing Insights

### Backend conftest.py
- Custom coverage report with Unicode progress bars
- `api_client` fixture provides unauthenticated DRF APIClient
- `authenticated_user` and `admin_user` fixtures for auth tests
- Coverage hooks auto-generate top-10 uncovered files report

### syncFromCookies Must Fetch User Data (Lesson Learned)
- `syncFromCookies()` initially only read tokens from cookies and set `isAuthenticated`
- On page reload, `user` object stayed null causing pages like my-profile to show skeleton forever
- Fix: added `fetchMe()` that calls `GET /auth/validate_token/` when tokens exist but user is null
- Validate_token endpoint must return all user fields the frontend needs (including phone, city)

### Stale Template References (Lesson Learned)
- When transforming from a template project, **ALL** test files must be audited
- Not just test files for deleted models — also helpers, utilities, conftest fixtures
- `Role.CUSTOMER` → `Role.ADOPTER` was missed in two test files despite model being correct
- The `urls.py` file path changed to `urls/__init__.py` and the test was not updated

### E2E Flow Definitions
- 75 flows defined in `frontend/e2e/flow-definitions.json` (single source of truth)
- Every E2E test must have `@flow:<flow-id>` tag
- Flow definitions include priority (P1–P4) and role
- 16 spec files across auth/, public/, app/, and contracts/ directories

### CI Pipeline
- Playwright E2E tests sharded into 5 parallel jobs
- Blob reports merged after all shards complete
- Test quality gate runs after all test suites pass
- Coverage reports generated for both backend and frontend

### Enriched Serializer Pattern (Phase 13a)
- When a list view needs data from related models, enrich the serializer with computed/FK fields rather than forcing extra API calls
- Example: `FavoriteSerializer` was enriched with 10 fields from the related `Animal` (breed, age_range, size, gender, vaccination status, shelter_city, thumbnail_url)
- Include a `note` field on the through-table for user-attached metadata

### Client-Side Filter/Sort UI Pattern (Phase 13a)
- For small datasets (user's favorites ≤ ~100 items), client-side filtering is simpler than server-side
- UI pattern: chip buttons for categorical filters (species, size) + dropdown for sort (recent/name/species)
- Grid/list view toggle with `localStorage` persistence for user preference
- Debounced auto-save (e.g., 500ms) for inline editable fields (favorite notes)

### Compare Mode Pattern (Phase 13a)
- Multi-select with floating action bar: user checks 2–3 items → fixed bottom bar shows count + "Compare" button
- Comparison rendered in a modal with a side-by-side table (columns = selected items, rows = attributes)
- Selection state managed locally in the page component, not in a global store
