# Mi Huella — Active Context

> Last updated: 2026-03-23

## Current State

The project has been fully transformed from the `base_django_react_next_feature` template into **Mi Huella**, an animal adoption, sponsorship, and donation platform.

### What's Working
- **Backend**: 16 models (added BlogPost), 34+ serializers (added 7 blog serializers), 14 view modules, 14 URL modules, admin site (7 sections), 15 management commands
- **Frontend**: 39 pages (added 6 blog pages), 10 Zustand stores (added blogStore), 23 shared UI components (added BlogContentRenderer, ReadingProgressBar), next-intl wired
- **Tests**: 77 backend tests passing (added 24 blog model + view tests), 54 frontend blog tests passing
- **E2E**: 49 flow definitions documented (added 6 blog flows), 12 spec files (added blog.spec.ts)
- **Design System**: Stone palette + teal/amber/emerald accents, Inter font, glassmorphism header
- **Blog Feature**: Full bilingual blog with public listing/detail, admin CRUD, calendar, JSON content, cover images, duplicate, SEO metadata

### What's Pending
- **Wompi payment integration**: Views are placeholder stubs
- **Backend view tests**: Only auth + blog endpoints have tests; shelter/animal/campaign views untested
- **Blog E2E tests**: 6 flows defined, spec created — needs live server validation
- **Factory-boy factories**: Commands use raw Faker; README should be updated or factories added
- **Notification model divergence**: Plan specified a single Notification model; implementation uses NotificationPreference + NotificationLog (decision needs documenting)

## Recent Changes (Blog Feature Implementation)
1. Created `BlogPost` model with bilingual fields, JSON content, SEO metadata, 10 animal-welfare categories, 2 authors
2. Added blog serializers (7 files: public list/detail, admin list/detail, create/update, JSON import, template)
3. Created blog views (14 endpoints: public list/detail, admin CRUD, duplicate, upload cover, calendar, JSON template)
4. Registered blog URLs under `/api/blog/` with admin and public patterns
5. Added `BlogPostAdmin` to Django admin with organized fieldsets and Blog section
6. Created `create_blog_posts` management command with 10 realistic sample posts
7. Added `BlogPost`, `BlogPostDetail`, `BlogPostAdmin` TypeScript types
8. Added blog API endpoints and routes to constants.ts
9. Created `blogStore` Zustand store with full CRUD + calendar + JSON import
10. Created `BlogContentRenderer` component (renders structured JSON: sections, FAQ, quotes, callouts, timeline, etc.)
11. Created `ReadingProgressBar` component (scroll progress + remaining time)
12. Created 6 frontend pages under `[locale]/`: blog listing, blog detail, admin list, admin create, admin edit, admin calendar
13. Updated Header/Footer navigation with Blog link, added i18n messages
14. Created 24 backend tests (8 model + 16 view) — all passing, blog views at 88.8% coverage
15. Created 54 frontend blog tests: blogStore (18), BlogContentRenderer (14), ReadingProgressBar (7), page tests (15)
16. Added 6 blog E2E flow definitions + flow-tags + blog.spec.ts (3 public + 4 admin tests)

## Previous Changes (Audit Implementation — Phase 2)
1. Extracted 13 new shared UI components: AnimalFilters, AnimalGrid, VerifiedBadge, ShelterProfile, FAQAccordion, HowItWorks, Hero, CTASection, PaymentMethodSelector, DonationForm, ApplicationStatusBadge, StatsCounter, PaymentConfirmation
2. Total shared components now: 21 (barrel-exported from `components/ui/index.ts`)
3. Added 4 missing auth E2E tests: auth-role-redirect, auth-sign-out, auth-session-persistence, auth-google-login
4. Created `e2e/public/faq.spec.ts` for PUBLIC_FAQ flow coverage
5. Added FAVORITE_TOGGLE E2E test to `adopter.spec.ts`
6. All 43 flow tags now have at least one test in 11 spec files

### Previous Changes (Phase 1)
1. Fixed 4 broken test files (stale old-model references)
2. Extracted 7 shared UI components (AnimalCard, ShelterCard, CampaignCard, AnimalGallery, EmptyState, LoadingSpinner, LocaleSwitcher)
3. Added ShelterSpotlight section to home page
4. Created 4 new fake data commands (adoptions, update_posts, adopter_intents, favorites)
5. Integrated GSAP ScrollTrigger (useScrollReveal hook) on home page
6. Integrated Swiper (AnimalGallery) on animal detail page
7. Added Framer Motion page transitions (template.tsx)
8. Wired next-intl with en/es translation files + LocaleSwitcher in Header
9. Created methodology docs (PRD, technical, architecture)

## Next Steps
- Validate blog E2E specs against live servers
- Add backend view tests for shelter/animal/campaign CRUD
- Integrate Wompi SDK when ready
- Document Notification model divergence decision
- Remove duplicate `docs/e2e-flow-definitions.json`
