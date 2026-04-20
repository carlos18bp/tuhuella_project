# Tuhuella — Active Context

> Last updated: 2026-04-20 (Phase 21 — Platform Support 5th Donation Flow)

## Current State

The project is a mature animal adoption platform with complete backend and frontend implementations, extensive test coverage, and a methodology system for maintaining context.

### What's Working
- **Backend**: 31 model classes (28 files), 45 serializers, 27 view modules, 24 URL modules, 27 admin classes, 21 management commands, 3 services
- **Frontend**: 64 pages, 13 Zustand stores, 93 components, 6 custom hooks, next-intl (en/es)
- **Tests**: 99+ backend test files, 289+ frontend unit test files, 20 E2E spec files
- **E2E**: 98 flow definitions documented across all roles and priorities
- **Design System**: Stone palette + teal/amber/emerald accents, Inter font, glassmorphism header, dark mode
- **Blog**: Full bilingual blog with public listing/detail, admin CRUD, calendar, JSON content, cover images, SEO
- **Volunteer Application System**: Full apply flow with model, form, reCAPTCHA, email notification
- **Branded Email Templates**: HTML table-based templates for all transactional emails (reset, verification, volunteer notification)
- **Shelter Detail**: Cover image with logo overlay + Swiper gallery carousel with lightbox
- **Campaign Evidence**: Lightbox gallery for completed campaigns + fake data seeding
- **Adoption Form — Pets at Home**: Conditional pets block (has_pets yes/no → type checkboxes → numeric counts per type); payload reshaped to `{has_pets: bool, pets: {cats, dogs, others}}`
- **Animal Health Section**: Disease screening catalog (dog/cat specific viruses) with tri-state results (color-coded), health pills with optional dates, bilingual medical notes, last vet checkup date
- **Roles**: 5 roles (adopter, shelter_admin, admin, veterinarian, web_manager); helpers in `utils/shelter_access.py`
- **Web Manager workspace**: Global applications board + shelter list + shelter detail (Info + Applications tabs); receives adoption_submitted notifications
- **Post-Adoption Follow-Up**: Auto-created +30 days on approval; vet workspace (list + detail + clinical entry form + mark complete); adopter read-only clinical history timeline; notification events for assignment/due-soon/overdue/entry-added

### What's Pending
- **Wompi payment integration**: Views are placeholder stubs
- **Huey periodic tasks**: `scan_stalled_applications` + `scan_follow_ups` deferred until `--periodic` flag on `tuhuella-huey.service` is confirmed
- **Web manager "Seguimientos" tab**: Follow-up tab on shelter detail (vet assignment dropdown) not yet wired
- **Shelter animal create/edit UI**: Backend supports new health fields; no frontend form yet

## Recent Focus Areas

### Shelter, Volunteer, Email & Bug Fixes (2026-03-27)

**Bug Fix — My Profile Not Loading:**
- Root cause: `syncFromCookies()` only read tokens but never fetched user data from API
- Added `fetchMe()` method to authStore that calls `GET /auth/validate_token/`
- `syncFromCookies` now triggers `fetchMe()` when tokens exist but user is null
- Added `phone` and `city` to validate_token and generate_auth_tokens responses

**Shelter Detail — Logo Overlay + Swiper Gallery:**
- Created `ShelterGallery.tsx` component (Swiper with Navigation + Pagination, responsive breakpoints, lightbox)
- Restructured shelter detail page: cover image as banner, logo as circular avatar overlapping cover at bottom-left
- Replaced static gallery grid with `<ShelterGallery>` carousel

**Volunteer Application System:**
- Backend: VolunteerApplication model (FK to VolunteerPosition + User), serializer with validation, FBV with IsAuthenticated + reCAPTCHA
- Frontend: Apply page with auto-fill from authStore, Zod-ready validation, character counter, success state
- Email notification to team@proyectapps.co on each application
- Django admin registration with fieldsets in "Voluntariado y Aliados" section

**Branded HTML Email Templates:**
- Created base_email.html: Teal header, Stone background, white card, table-based layout
- Created 3 specific templates: password_reset_code, verification_code, volunteer_application_notification
- Centralized all email functions in email_utils.py with render_to_string + HTML + plain text fallback

**Campaign Evidence Fake Data:**
- Modified create_campaigns.py to download 3-6 images from picsum.photos for completed campaigns
- Evidence gallery + lightbox already implemented in frontend, now visible with data

**Improvement Suggestions Implemented:**
- S1: reCAPTCHA on volunteer application form (same pattern as sign-in/sign-up)
- S2: Replaced `<img>` with `next/image` for lazy loading in shelter detail + campaign detail
- S3: Centralized email functions from auth_utils.py into email_utils.py + EmailService class

## Architecture Snapshot

| Asset | Count |
|-------|-------|
| Backend model classes | 31 (28 files) |
| Backend serializers | 45 |
| Backend views | 27 |
| Backend URL modules | 24 |
| Backend admin classes | 27 |
| Management commands | 21 |
| Frontend pages | 64 |
| Zustand stores | 13 |
| UI components | 70 |
| Total frontend components | 94 |
| Custom hooks | 6 |
| Exported types | ~56 |
| Backend test files | 100+ |
| Frontend unit test files | 289+ |
| E2E spec files | 20 |
| E2E flow definitions | 98 |

## Recently Completed: Phase 21 — Platform Support 5th Donation Flow (2026-04-20)

Added a 5th way to support Tuhuella: donations directed at sustaining the platform's own infrastructure (servers, hosting, email, dev costs).

**Backend:**
- Data migration `0021_platform_support_content.py`: seeds `FAQTopic(slug="apoyo-plataforma")` with 5 bilingual `FAQItem`s and 1 bilingual `BlogPost(slug="por-que-tuhuella-tiene-costos", category="historias")` — idempotent via `get_or_create`.
- `notification_templates.py`: added `platform_donation_paid` and `platform_donation_failed` keys with platform-specific copy (no shelter/campaign references).
- `signals.py` (`on_donation_save`): detects `donation.destination == PLATFORM`; routes to platform notification keys; skips shelter-owner notification for platform donations.
- `views/notification.py`: added both new keys to `EVENT_KEYS` list for preference initialization.

**Frontend:**
- New page `/apoya-la-plataforma`: hero + cost breakdown cards (4 icons) + transparency panel + 5-ways comparison grid + FAQ accordion + bottom CTA.
- New page `/checkout/platform`: rose-themed checkout mirroring `/checkout/donation`; fetches amounts from `/api/donation-amounts/`; POSTs with `destination: "platform"`.
- `constants.ts`: `ROUTES.PLATFORM_SUPPORT` + `ROUTES.CHECKOUT_PLATFORM`.
- Header: "Apoya la plataforma" nav item between `lookingToAdopt` and `blog`.
- Footer: link in "information" column.
- Home (`page.tsx`): `PlatformSupportCTA` section between campaigns and "Why Adopt".
- `my-donations/page.tsx`: rose "Plataforma" badge when `donation.destination === 'platform'`.
- `messages/{es,en}.json`: `platformSupport`, `platformCheckout`, `myDonationsBadge.platform` namespaces (76 new keys each language).

**Verification:** `python manage.py check` clean; `pytest test_signals.py -k donation` 1 passed; `tsc --noEmit` no new errors in changed files.

---

## Recently Completed: Phase 20 — Activity Timeline for All Roles (2026-04-20)

The "Actividad Reciente" card in `/my-profile` (below the user info card) now renders for every role, populated with role-specific events from the backend.

**Backend (`backend/base_feature_app/views/profile.py`):**
- `user_activity(request)` extended with per-role branches (if/elif after the 4 cross-role loops):
  - `shelter_admin`: Animal added, Campaign created, AdoptionApplication reviewed, Donation received — all filtered by the shelter the user owns.
  - `veterinarian`: ClinicalHistoryEntry authored by user, PostAdoptionFollowUp completed and assigned to user.
  - `web_manager`: Campaign reviewed (reviewed_by=user, reviewed_at set).
  - `admin`: Shelter verified (verified_at set, global — no "who verified" field on model).
- New imports: `ClinicalHistoryEntry`, `PostAdoptionFollowUp`.
- Cross-role events (application/donation/sponsorship/favorite) continue to run unconditionally — any user who has them sees them.

**Frontend:**
- `frontend/lib/types.ts` — `ActivityEvent.type` union widened from 4 to 12 members; new optional `campaign_title` field added.
- `frontend/app/[locale]/my-profile/page.tsx`:
  - `isAdopter` gate removed from the "Actividad Reciente" card — card renders for all roles.
  - `useEffect` now calls `fetchActivity()` for all roles; `fetchProfileStats()` remains adopter-only.
  - `ActivityTimeline` gains `showExploreCta?: boolean` prop (defaults `true`); CTA to `/animals` is hidden for non-adopter roles in the empty state.
  - `iconMap` and `getDescription` switch extended with 8 new cases; new lucide icons imported (`Stethoscope`, `CheckCircle2`, `PawPrint`).
- `frontend/messages/{es,en}.json` — 8 new `activity*` keys under `profile` namespace.

**Verification:** `python manage.py check` clean; `pytest test_profile_views.py -v` → 23 passed; `tsc --noEmit` no new errors in changed files.

---

## Recently Completed: Phase 19 — Role Profile Sections + Manual Filtered by Role (2026-04-20)

`veterinarian` and `web_manager` roles now have meaningful activity cards in `/my-profile`, and the in-app manual is open to all authenticated users with content filtered by role.

**Profile sections:**
- New `VeterinarianProfileSection`: stats grid (pending/in_progress/completed/overdue follow-ups) derived from `useFollowUpStore`; quick action to `/veterinarian/follow-ups`.
- New `WebManagerProfileSection`: 3 stats (pending shelters, submitted applications, pending campaigns) via parallel `api.get` calls (local state, not store — avoids store pollution); 4 quick actions.
- `my-profile/page.tsx`: role→heading lookup map replaces ternary chain; renders `<VeterinarianProfileSection>` and `<WebManagerProfileSection>` conditionally; new `crossActivityLinks` (notifications, FAQ, terms) rendered for non-adopter roles below the custom section.
- i18n: added `profile.veterinarianResponsibilities`, `profile.webManagerResponsibilities`; extended `webManager.*` with `overviewTitle`, `pendingShelters`, `submittedApplications`, `pendingCampaigns`, `newCampaign`.

**Manual open to all authenticated users:**
- New `lib/manual/filterByRole.ts`: `canViewManualAudience` and `filterManualSectionsForRole`; `web_manager`/`admin` see all; others see `cross` + `public` + their own audience.
- `manual/layout.tsx`: removed `canAccessStaffArea` gate; now only `useRequireAuth()`.
- `manual/page.tsx`: computes `visibleSections = filterManualSectionsForRole(MANUAL_SECTIONS, user.role)` via `useMemo`; passes filtered list to sidebar, search, and body.
- `ManualSearch.tsx` + `useManualSearch.ts`: optional `sections` prop (defaults to `MANUAL_SECTIONS`) so search index respects role filtering.
- `manual.eyebrow` translation changed from "Solo para web managers y admins" to "Guía paso a paso de Tuhuella" / "Step-by-step Tuhuella guide".
- Removed dead keys: `manual.accessDenied`, `webManager.totalShelters`.
- `layout.test.tsx`: replaced denied-access assertions with `it.each` over all 5 roles asserting children render.
- 58 tests passing across 6 test suites; lint clean.

---

## Recently Completed: Phase 18 — Auth Security Hardening (2026-04-20)

End-to-end review and hardening of the password reset and sign-in flows (both backend + frontend).

**Backend:**
- Added `PasswordResetSendThrottle` (5/hr), `PasswordResetVerifyThrottle` (10/hr), `SignInThrottle` (10/min) — all `AnonRateThrottle` subclasses applied via `@throttle_classes`
- Added `DEFAULT_THROTTLE_RATES` dict to `REST_FRAMEWORK` settings; rates are env-var overridable
- Added `validate_password(new_password, user=user)` in `verify_passcode_and_reset_password` — placed **after** passcode validation to avoid user enumeration
- Added `update_last_login(None, user)` before token generation in both `sign_in()` and `google_login()`
- `user.save(update_fields=['password'])` + `password_code.save(update_fields=['used'])` for targeted DB writes
- `send_passcode` now reads `locale` from request body and passes to `email_utils`
- English password reset email template (`emails/password_reset_code_en.html`, extends base_email.html)
- Locale-aware dispatch via `PASSWORD_RESET_EMAIL_LOCALES` dict in `email_utils.py`
- New tests: `test_verify_passcode_rejects_weak_password`, `test_send_passcode_passes_locale_to_email_helper`, `test_sign_in_updates_last_login`, `test_sign_in_rate_limited`, English/fallback email locale tests

**Frontend:**
- `forgot-password/page.tsx`: fully i18n'd with `useTranslations('forgotPassword')` + `useLocale()`; passes locale to API
- `sign-in/page.tsx`: fully i18n'd; added `safeRedirectTarget()` open-redirect guard + `?redirect=` support (safe relative paths only); `useSearchParams` from `next/navigation`
- New `forgotPassword` namespace (~28 keys) in `messages/{es,en}.json`; extended `auth` namespace (14 keys); `auth.signingIn` removed (reuses `common.signingIn`)
- `authStore.sendPasswordResetCode` accepts optional `locale` param
- New sign-in tests: redirect safety (`it.each` for unsafe URLs + safe path), i18n string assertions updated to Spanish

---

## Recently Completed: Phase 17 — Header UI/UX Overhaul + Responsive Optimization (2026-04-19)

**Problem**: Staff-role header was overloaded: web_manager had 8+ inline items at 768px, causing crowding. Tablets got the full desktop header despite lacking the width. No notification badge visible on mobile.

**Panel Dropdown** per role (`buildRolePanel`): replaces the single deep-link with a grouped menu matching the sidebar scope:
- `shelter_admin` → 7 items (Dashboard, Animales, Solicitudes, Campañas, Donaciones, Actualizaciones, Ajustes)
- `web_manager` → 3 items (Solicitudes, Refugios, Campañas)
- `admin` → 6 items (Dashboard, Aprobar refugios, Moderación, Pagos, Métricas, Blog)
- `veterinarian` → single `<Link>` (no dropdown)

**Avatar Dropdown**: collapses Mi Perfil + Favoritos + Cerrar sesión + conditional Manual into one button. `accountItems[]` array shared by desktop dropdown and mobile drawer, eliminating drift.

**`DropdownMenu` primitive** (`components/ui/DropdownMenu.tsx`): extracted from 3 hand-rolled outside-click handlers. Uses `useId()` for SSR-safe IDs. Provides `getTriggerProps()` to wire ARIA at call sites. Handles Escape + arrow-key nav. Used by About, Notification bell, Panel, and Avatar dropdowns.

**Responsive overhaul**: desktop breakpoint promoted from `md:` (768) to `lg:` (1024). Tablets now get the mobile drawer. Mobile bell (`<Link href={MY_NOTIFICATIONS}>` with `UnreadBadge`) added beside hamburger when authenticated. Hamburger touch target bumped from `p-2` → `p-2.5` (WCAG 44×44). Gap polish: `xl:gap-1 2xl:gap-2` on public nav, `2xl:gap-3` on auth side.

**`UnreadBadge` local component**: extracted duplicated badge + 99+ ternary used by desktop and mobile bells.

**Header.tsx**: 465 → 610 lines. **Tests**: 27 → 29 passing. **New file**: `components/ui/DropdownMenu.tsx` (133 lines).

---

## Recently Completed: Phase 13a — Enriched Favorites View

### What Was Done
Complete overhaul of the favorites page with 14 parts implemented:

**Backend:**
- Added `note` field to Favorite model + migration
- Enriched `FavoriteSerializer` with 10 new fields (breed, age_range, size, gender, is_vaccinated, is_sterilized, status, shelter_city, thumbnail_url, note)
- New `PATCH /favorites/{id}/` endpoint for note updates
- `favorite_toggle` now returns full serialized favorite on add
- 5 new backend tests (enriched fields, toggle returns favorite, note CRUD, auth, ownership)

**Frontend:**
- Replaced custom inline cards with `AnimalCard` component
- Status badge overlays (adopted=red, in_process=amber, unavailable=grey)
- Remove favorite button with inline confirmation
- Counter in page title
- Relative date display ("Guardado hace X días")
- Client-side filters by species and size (chips)
- Sort by recent/name/species (dropdown)
- Grid/list view toggle with localStorage persistence
- Personal notes per favorite with debounced auto-save
- Compare mode: select 2-3 animals, floating bar, comparison table modal
- Enhanced empty state with popular animals suggestion
- 36 new i18n keys (es + en)
- 14 frontend unit tests (all passing)

## Recently Completed: Phase 14 — Adoption, Health, Roles & Follow-Up (2026-04-19)

Four phases shipped in one session:

**Fase 1 — Adoption form pets-at-home:**
- Custom `<fieldset>` injected inside `SECTIONS.map` via `React.Fragment` key wrapper
- `has_pets` select → conditional checkboxes for cats/dogs/others → numeric count per checked type
- `buildFormAnswers()` reshapes to `{has_pets: bool, pets: {cats, dogs, others}}`
- `isPetsBlockValid()` validates at least one type with count ≥ 1 when `has_pets=yes`

**Fase 2 — Animal health + disease screening:**
- 6 new Animal fields (dewormed, dates, medical notes)
- `AnimalDiseaseScreening` model with unique_together per animal+disease
- `AnimalHealthSection` component with color-coded disease grid
- N+1 fixes: `prefetch_related('disease_screenings')` in `animal_detail` view

**Fase 3 — Roles + web manager:**
- `veterinarian` + `web_manager` added to `User.Role`
- `utils/shelter_access.py` helpers (no permission classes, per convention)
- Global applications board + cross-shelter shelter list for web_manager
- `adoption_submitted` dispatched to all web_managers on new application

**Fase 4 — Post-adoption + vet workspace:**
- `PostAdoptionFollowUp` OneToOneField to `AdoptionApplication`; auto-created on approval via signal
- `ClinicalHistoryEntry` with 5 entry types, bilingual body
- `ClinicalHistoryTimeline` shared between vet detail and adopter history pages (extracted during /simplify)
- N+1 fix: `prefetch_related('clinical_entries')` in `follow_up_detail` view
- 4 new notification event keys + bilingual templates

**Test run post-/simplify:** Backend 12/12, Frontend 20/20 all passing.

## Recently Completed: Phase 15 — Campaign Approval Workflow (2026-04-19)

Full shelter-requests → web_manager-moderates → chat cycle implemented:

**Backend:**
- `Campaign` model extended: `approval_status` (pending/approved/rejected), `submitted_at`, `reviewed_by` (FK User SET_NULL), `reviewed_at`
- New `CampaignMessage` model: persistent chat between shelter and web_manager; `is_system` flag for auto-messages on approve/reject
- Migration 0020 with data-migration: marks all pre-existing active/completed campaigns as `approval_status=approved`
- Public `campaign_list` now filters `approval_status=approved`
- `campaign_create`: shelter_admin → pending; web_manager/admin → approved (bypasses workflow)
- Added `campaign_submit` endpoint: moves rejected campaign back to pending
- Added `campaign_messages` endpoint (GET/POST): scope-checked (shelter owner or web_manager/admin); notifies counterparty on new message
- `campaign_admin.py`: `admin_campaigns_list` (paginated + filterable), `admin_campaign_approve`, `admin_campaign_reject`
- Django signals: `post_save` on Campaign notifies all web_managers when `approval_status` becomes `pending`
- 4 new notification templates: `campaign_request_submitted`, `campaign_approved`, `campaign_rejected`, `campaign_new_message`
- 10 new backend tests (all passing)

**Frontend:**
- `CampaignMessage` type + `CampaignApprovalStatus` in `lib/types.ts`
- New API endpoints + routes in `lib/constants.ts`
- `campaignStore`: added `createCampaign`, `updateCampaign`, `submitForApproval`, `fetchMyCampaigns`, `fetchMessages`, `sendMessage`; state `messagesByCampaign`
- `webManagerStore`: added `campaigns`, `campaignsMeta`, `campaignsLoading`, `fetchCampaigns`, `approveCampaign`, `rejectCampaign`
- New pages: `web-manager/campaigns/page.tsx` (tabs: Pendientes/Aprobadas/Rechazadas/Todas), `web-manager/campaigns/[id]/page.tsx` (approve/reject with reason), `web-manager/campaigns/new/page.tsx` (direct create with shelter selector), `shelter/campaigns/[id]/page.tsx` (edit + resubmit + chat), `shelter/campaigns/nueva/page.tsx` (request form → pending)
- `CampaignMessageThread` component: cache-aware, bubble styles by role/author, system message badges
- `shelter/campaigns/page.tsx` updated: uses `fetchMyCampaigns`, shows approval badges, rejection banners

## Recently Completed: Phase 16 — Interactive In-App Manual (2026-04-19, refined 2026-04-19)

### Phase 16 Refinement — Non-Technical Manual Rewrite

Manual rewritten as a fully non-technical reference for operations staff (web_manager / admin / is_staff).

**Removed from content.ts:** `tech-stack`, `three-services`, `cross-auth-jwt` (JWT/axios details), `cross-notifications` (NotificationLog/Huey internals), old `cross-payments` technical ficha.

**`endpoints` field eliminated end-to-end:**
- `ManualProcess.endpoints?: string[]` removed from `lib/manual/types.ts`
- All `endpoints: [...]` entries removed from 25+ processes in `content.ts`
- Endpoint rendering block removed from `ProcessCard.tsx`; route section simplified to single `<section>` (was 2-column grid)
- `messages/{es,en}.json`: `manual.card.endpoints` key removed; `manual.card.route` → "Dónde encontrarlo" / "Where to find it"; `manual.card.tips` → neutral label

**New section added — "Cómo empezar" (`getting-started`, highlighted):** crear cuenta, iniciar sesión, recuperar contraseña, cambiar idioma.

**New processes added:** public-about, public-faq, public-contact, public-strategic-allies, public-terms, public-work-with-us, public-volunteer-apply, public-looking-to-adopt, adopter-edit-profile, adopter-notifications-inbox, adopter-notification-preferences (split from combined ficha), adopter-my-donations, adopter-my-sponsorships, shelter-dashboard, shelter-settings, shelter-edit-campaign, wm-campaign-detail, admin-login, admin-impersonate, cross-session-expired, cross-emails (user-facing), cross-payments (rewritten as user-facing), cross-bilingual, roles-overview.

**Jargon purged everywhere:** no Django, DRF, Huey, Gunicorn, systemd, nginx, JWT, Wompi, AdoptionApplication, NotificationLog, PostAdoptionFollowUp, verification_status=, approval_status=, interceptor, CRUD.

**Outcome:** 8 sections → 9 sections (added getting-started); ~37 processes → ~72 processes; 33/33 unit tests pass; 0 manual-related TypeScript errors.

---

## Recently Completed: Phase 16 — Interactive In-App Manual (2026-04-19)

Role-gated manual for `web_manager` and `admin` (and `is_staff`), accessible at `/[locale]/manual`.

**Architecture:**
- `lib/manual/types.ts` — `ManualProcess`, `ManualSection`, `ManualSearchHit`, `ManualAudience`, `LocalizedText`, `LocalizedList`
- `lib/manual/content.ts` — 8 sections, ~37 processes, fully bilingual (es/en) paired fields (mirrors Django model pattern)
- `lib/manual/useManualSearch.ts` — Fuse.js fuzzy search hook with `useDeferredValue`, weighted keys (title 0.5 > keywords 0.25 > summary 0.15 > steps 0.07), max 12 results
- `lib/auth/permissions.ts` — `canAccessStaffArea(user)` deduplicates role check across layout + Header

**Components:**
- `components/manual/ManualSearch.tsx` — sticky search bar, dropdown with keyboard nav (↑/↓/Enter/Esc), Cmd/Ctrl+K global shortcut, scroll-to-highlight with timer cleanup
- `components/manual/ManualSidebar.tsx` — collapsible accordion sections, mobile toggle + desktop sticky (mirrors Sidebar.tsx pattern)
- `components/manual/ProcessCard.tsx` — anchor card with title/badge/why/steps/route/endpoints/tips (amber callout)
- `components/manual/RoleBadge.tsx` — 7 color-coded audience badges

**Pages/Layout:**
- `app/[locale]/manual/layout.tsx` — `useRequireAuth()` + `canAccessStaffArea(user)` → `AdminAccessDenied`
- `app/[locale]/manual/page.tsx` — shell: sticky search + sidebar + section headers + `ProcessCard[]`

**i18n:** `manual` namespace in `messages/es.json` + `en.json` (chrome only; content lives in `content.ts`)
**Dependencies:** Added `fuse.js ^7.3.0` to `frontend/package.json`
**Header:** Conditional "Manual" link (violet, BookOpen icon) visible only for web_manager/admin/is_staff

**Tests:** 11/11 Jest tests passing across layout gate, search hook, and search component.

---

## Pending: Phase 13b — Enriched My-Profile Dashboard
(Plan documented in tasks_plan.md — waiting to implement)

### E2E Test Improvements (2026-03-29)
- Updated `adopter.spec.ts` and `blog.spec.ts` with improved test coverage and flow tags
- Updated `flow-definitions.json` and `flow-tags.ts` helper with new flow mappings
- Total E2E spec files: 16 (up from 14)

## Next Steps
- Wire web-manager "Seguimientos" tab on shelter detail (vet assignment dropdown)
- Add Huey periodic task for campaign closure automation (`ends_at` expiry + `raised_amount >= goal_amount`)
- Add Huey periodic tasks once `--periodic` confirmed on `tuhuella-huey.service`
- Integrate Wompi SDK when ready
- Add E2E flow definitions for campaign approval flows + volunteer application + post-adoption flows
