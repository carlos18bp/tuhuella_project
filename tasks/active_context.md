# Mi Huella — Active Context

> Last updated: 2026-03-29

## Current State

The project is a mature animal adoption platform with complete backend and frontend implementations, extensive test coverage, and a methodology system for maintaining context.

### What's Working
- **Backend**: 24 model classes (21 files), 44 serializers, 22 view modules, 20 URL modules, 22 admin classes, 21 management commands, 3 services
- **Frontend**: 49 pages, 10 Zustand stores, 41 components (31 UI + 6 layout + 2 blog + 2 providers), 4 custom hooks, next-intl (en/es)
- **Tests**: 57 backend test files, 107 frontend unit test files, 16 E2E spec files
- **E2E**: 75 flow definitions documented across all roles and priorities
- **Design System**: Stone palette + teal/amber/emerald accents, Inter font, glassmorphism header, dark mode
- **Blog**: Full bilingual blog with public listing/detail, admin CRUD, calendar, JSON content, cover images, SEO
- **Volunteer Application System**: Full apply flow with model, form, reCAPTCHA, email notification
- **Branded Email Templates**: HTML table-based templates for all transactional emails (reset, verification, volunteer notification)
- **Shelter Detail**: Cover image with logo overlay + Swiper gallery carousel with lightbox
- **Campaign Evidence**: Lightbox gallery for completed campaigns + fake data seeding

### What's Pending
- **Wompi payment integration**: Views are placeholder stubs

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
| Backend model classes | 24 (21 files) |
| Backend serializers | 44 |
| Backend views | 22 |
| Backend URL modules | 20 |
| Backend admin classes | 22 |
| Management commands | 21 |
| Frontend pages | 49 |
| Zustand stores | 10 |
| UI components | 31 |
| Total frontend components | 41 |
| Custom hooks | 4 |
| Exported types | 40 |
| Backend test files | 57 |
| Frontend unit test files | 107 |
| E2E spec files | 16 |
| E2E flow definitions | 75 |

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

## Pending: Phase 13b — Enriched My-Profile Dashboard
(Plan documented in tasks_plan.md — waiting to implement)

### E2E Test Improvements (2026-03-29)
- Updated `adopter.spec.ts` and `blog.spec.ts` with improved test coverage and flow tags
- Updated `flow-definitions.json` and `flow-tags.ts` helper with new flow mappings
- Total E2E spec files: 16 (up from 14)

## Next Steps
- Implement Phase 13b (enriched my-profile dashboard)
- Integrate Wompi SDK when ready
- Add tests for new volunteer application system (backend views, serializer, frontend form)
- Add E2E flow definitions for volunteer application flow
