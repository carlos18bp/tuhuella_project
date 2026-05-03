---
trigger: manual
description: Project intelligence and lessons learned. Reference for project-specific patterns, preferences, and key insights discovered during development.
---

# Lessons Learned — Tuhuella

> Last updated: 2026-05-03 (added FileField vs Library decision + MEDIA_ROOT test override)

This file captures important patterns, preferences, and project intelligence that help work more effectively with this codebase. Updated as new insights are discovered.

---

## 1. Architecture Patterns

### Single Django App: `base_feature_app`
- All 27 model classes (24 files), views, serializers, and services live in `base_feature_app`
- App name kept from template to avoid migration headaches
- Models split into individual files under `base_feature_app/models/`
- URLs split into 22 sub-modules under `base_feature_app/urls/`

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

### Non-Image Media: plain `FileField`, not `django_attachments`
- `django_attachments`'s `Library` model is image-oriented (`ThumbnailerField`, `image_width`/`image_height`); using it for video, audio, or PDF makes the admin UI try to thumbnail and fight the format.
- For non-image uploads use a plain `models.FileField(upload_to='<scope>/<kind>/', null=True, blank=True, validators=[FileExtensionValidator([...])])`. Reference: `Shelter.video` (Phase 23) — `upload_to='shelters/videos/'` with extensions `mp4/webm/mov/ogg`.
- Plain `FileField` is **not** auto-cleaned by `django-cleanup` in the same way Library files are. If hard delete is expected, override the model's `delete()` to call `self.<field>.delete(save=False)` after super() OR within the cleanup loop. Soft delete (`archived_at`) intentionally preserves the file.
- The serializer pattern stays the same as image URLs: a `SerializerMethodField` named `<field>_url` returning `obj.<field>.url` or `''`, exposed only in the detail serializer if the field is admin-managed.

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
- Stores: `adoptionStore`, `animalStore`, `authStore`, `blogStore`, `campaignStore`, `donationStore`, `favoriteStore`, `notificationStore`, `shelterStore`, `sponsorshipStore`
- HTTP requests go through centralized `lib/services/http.ts` Axios instance
- Token management via `lib/services/tokens.ts` + `js-cookie`

### i18n Pattern (next-intl)
- URL-prefix routing via `app/[locale]/` dynamic segments (`/es/`, `/en/`)
- Default locale: `es`
- `i18n/request.ts` resolves locale from the URL segment
- Translation files: `messages/en.json`, `messages/es.json`

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

### When Opening a Feature to More Roles, Audit Every Gate (Lesson Learned)
- Phase 19 (2026-04-20) opened the in-app manual to all authenticated users by removing `canAccessStaffArea` from `manual/layout.tsx`, but the **Header link gate** in `components/layout/Header.tsx` was missed and stayed staff-only — non-staff roles had no entry point unless they typed `/manual` directly.
- Symptom is delayed and confusing: the user remembered building the manual but couldn't find it, so it looked deleted.
- Lesson: when widening audience for a feature, grep for **every** instance of the prior gate helper (in this case `canAccessStaffArea`) — page guards, route guards, middleware, navigation links, footer links, breadcrumbs — and decide each one explicitly. The page-level gate alone is not enough; if the link is hidden, the feature is effectively missing for the affected roles.
- Bonus: when removing a per-feature gate, also check whether the remaining `const canAccessFoo = …` becomes dead code (always-true) inside its render context. Both Manual call sites already lived inside `isAuthenticated`-gated branches, so the boolean and its `{… && …}` wrappers were redundant after the gate switch and should be deleted, not just relaxed.

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

### Testing `FileField` upload — override `MEDIA_ROOT` to a tmp dir
- Saving a `SimpleUploadedFile` to a model with a `FileField` triggers Django's `FileSystemStorage`, which writes under the project's real `MEDIA_ROOT` (e.g. `backend/media/`). On the dev box this directory is **not writable by the test runner's user** and you get `PermissionError: [Errno 13] Permission denied: '<MEDIA_ROOT>/<upload_to>'`.
- Fix: use pytest's built-in `settings` and `tmp_path` fixtures together so the override applies and is cleaned up automatically:
  ```python
  @pytest.mark.django_db
  def test_serializer_returns_video_url(shelter, settings, tmp_path):
      settings.MEDIA_ROOT = str(tmp_path)
      shelter.video = SimpleUploadedFile('demo.mp4', b'\x00...', content_type='video/mp4')
      shelter.save()
      assert ShelterDetailSerializer(shelter).data['video_url'].startswith('/media/')
  ```
- This pattern applies to **any** `FileField` test that actually saves bytes to disk. Without it the test pollutes (or fails to write to) the live media directory.

### DRF Throttle Rate Testing — monkey-patch `get_rate`, not `@override_settings`
- `@override_settings(REST_FRAMEWORK={...})` has NO effect on DRF throttle rates during tests.
- DRF caches `api_settings.DEFAULT_THROTTLE_RATES` at class-load (module import) time.
- The only reliable approach: monkey-patch the `get_rate` method on the throttle class with a `try/finally` restore:
  ```python
  original_get_rate = SignInThrottle.get_rate
  SignInThrottle.get_rate = lambda self: '3/minute'
  try:
      # trigger N+1 requests and assert 429
  finally:
      SignInThrottle.get_rate = original_get_rate
  ```
- Always add an autouse fixture with `cache.clear()` before each test to prevent throttle hit-count leakage between tests (DRF stores counts in Django's cache).

---

## 6. Security Patterns

### Rate Limiting — `AnonRateThrottle` subclassing
- All public auth endpoints (`sign_in`, `google_login`, `send_passcode`, `verify_passcode_and_reset_password`) are decorated with `@throttle_classes([<ScopeThrottle>])`.
- Each scope is an `AnonRateThrottle` subclass with a named `scope`. Default rates live in `settings.py` `REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']` and are overridable via env vars (e.g., `DJANGO_THROTTLE_SIGN_IN`).
- Pattern to add a new throttle:
  ```python
  class MyEndpointThrottle(AnonRateThrottle):
      scope = 'my_endpoint'
  ```
  Add `'my_endpoint': os.getenv('DJANGO_THROTTLE_MY_ENDPOINT', 'N/period')` to settings.

### Open-Redirect Prevention — `safeRedirectTarget()`
- After successful login, read `?redirect=` from search params, but only accept safe relative paths.
- Reject anything that doesn't start with `/`, or starts with `//` (protocol-relative URLs that browsers treat as absolute).
  ```ts
  function safeRedirectTarget(value: string | null | undefined): string | null {
    if (!value) return null;
    if (!value.startsWith('/') || value.startsWith('//')) return null;
    return value;
  }
  ```
- Fall back to `ROUTES.HOME` when the target is absent or unsafe.

### Locale-Aware Transactional Email — dict-based dispatch
- Instead of `if locale == 'en': ... else: ...` branches, use a locale dict in `email_utils.py`:
  ```python
  MY_EMAIL_LOCALES = {
      'es': {'subject': '...', 'template': 'emails/foo.html', 'text': '...'},
      'en': {'subject': '...', 'template': 'emails/foo_en.html', 'text': '...'},
  }
  ```
- Look up with `MY_EMAIL_LOCALES.get((locale or '').lower(), MY_EMAIL_LOCALES['es'])` to default to Spanish.
- The `locale` value is read from the request body (passed by the frontend after `useLocale()`).

### `validate_password()` Placement in Password Reset
- Call `validate_password(new_password, user=user)` **after** validating and consuming the passcode, not before.
- Calling it before would still require looking up the user, leaking whether the email exists and whether the code is valid before the strength check fires — a subtle user-enumeration vector.
- Place it immediately after the passcode `is_used` / expiry check, before `user.set_password()`.

### `update_last_login` on Successful Auth
- Call `update_last_login(None, user)` (from `django.contrib.auth.models`) before generating tokens in both `sign_in()` and `google_login()`.
- This is Django's standard signal-compatible helper; it sets `user.last_login` without requiring a full `user.save()`.
