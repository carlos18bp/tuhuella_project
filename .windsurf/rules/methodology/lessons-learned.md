---
trigger: manual
description: Project intelligence and lessons learned. Reference for project-specific patterns, preferences, and key insights discovered during development.
---

# Lessons Learned — Mi Huella

This file captures important patterns, preferences, and project intelligence that help work more effectively with this codebase. Updated as new insights are discovered.

---

## 1. Architecture Patterns

### Single Django App: `base_feature_app`
- All 16 models, views, serializers, and services live in `base_feature_app`
- App name kept from template to avoid migration headaches
- Models split into individual files under `base_feature_app/models/`
- URLs split into 13 sub-modules under `base_feature_app/urls/`

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
- `django-cleanup` auto-deletes orphaned files on model delete

---

## 2. Code Style & Conventions

### Backend: Function-Based Views (FBV)
- **All** DRF views use `@api_view` decorators, not class-based views
- Never convert to CBV unless explicitly requested
- Each domain has its own view module: `views/animal.py`, `views/shelter.py`, etc.

### Frontend: Zustand Stores
- **All** stores use Zustand with TypeScript types
- 9 stores: `authStore`, `animalStore`, `shelterStore`, `campaignStore`, `donationStore`, `sponsorshipStore`, `favoriteStore`, `localeStore`, `notificationStore`
- HTTP requests go through centralized `lib/services/http.ts` Axios instance
- Token management via `lib/services/tokens.ts` + `js-cookie`

### i18n Pattern (next-intl)
- Locale stored in Zustand `localeStore` with `persist` middleware (cookie)
- `i18n/request.ts` reads locale from cookie on server side
- Translation files: `messages/en.json`, `messages/es.json`
- No URL prefix approach — single URL set for all locales

### Naming Conventions
- Backend: snake_case for everything (Python standard)
- Frontend stores: camelCase file names (`animalStore.ts`)
- Frontend components: PascalCase (`AnimalCard.tsx`, `ShelterCard.tsx`)
- Frontend hooks: camelCase with `use` prefix (`useScrollReveal.ts`, `useRequireAuth.ts`)
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
- 12 management commands create realistic test data
- Run in dependency order via `python manage.py create_fake_data`
- Delete all via `python manage.py delete_fake_data` (preserves superusers)
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
- **Swiper**: Image carousels via `AnimalGallery` component
- **Framer Motion**: Page transitions via `app/template.tsx`

### Shared Components (`components/ui/`)
- `AnimalCard` — animal grid card with species emoji, badges
- `ShelterCard` — shelter card with verified badge
- `CampaignCard` — campaign card with progress bar
- `AnimalGallery` — Swiper-based image gallery with fallback emoji
- `EmptyState` — centered empty state with icon + message
- `LoadingSpinner` — animated spinner with size variants

---

## 5. Testing Insights

### Backend conftest.py
- Custom coverage report with Unicode progress bars
- `api_client` fixture provides unauthenticated DRF APIClient
- `authenticated_user` and `admin_user` fixtures for auth tests
- Coverage hooks auto-generate top-10 uncovered files report

### Stale Template References (Lesson Learned)
- When transforming from a template project, **ALL** test files must be audited
- Not just test files for deleted models — also helpers, utilities, conftest fixtures
- `Role.CUSTOMER` → `Role.ADOPTER` was missed in two test files despite model being correct
- The `urls.py` file path changed to `urls/__init__.py` and the test was not updated

### E2E Flow Definitions
- 43 flows defined in `frontend/e2e/flow-definitions.json`
- Mirror copy in `docs/e2e-flow-definitions.json` (keep in sync)
- Every E2E test must have `@flow:<flow-id>` tag
- Flow definitions document includes priority (P1–P4) and role

### CI Pipeline
- Playwright E2E tests sharded into 5 parallel jobs
- Blob reports merged after all shards complete
- Test quality gate runs after all test suites pass
- Coverage reports generated for both backend and frontend
