# Mi Huella — Active Context

> Last updated: 2026-03-22

## Current State

The project has been fully transformed from the `base_django_react_next_feature` template into **Mi Huella**, an animal adoption, sponsorship, and donation platform.

### What's Working
- **Backend**: 15 models, 34 serializers, 13 view modules, 13 URL modules, admin site, 14 management commands
- **Frontend**: 33 pages, 9 Zustand stores, 21 shared UI components, GSAP/Swiper/Framer Motion integrated, next-intl wired
- **Tests**: 53 backend tests passing (models, views, serializers, admin, URLs)
- **E2E**: 43 flow definitions documented, 11 spec files covering all flow tags
- **Design System**: Stone palette + teal/amber/emerald accents, Inter font, glassmorphism header

### What's Pending
- **Wompi payment integration**: Views are placeholder stubs
- **Backend view tests**: Only auth endpoints have tests; shelter/animal/campaign views untested
- **Factory-boy factories**: Commands use raw Faker; README should be updated or factories added
- **Notification model divergence**: Plan specified a single Notification model; implementation uses NotificationPreference + NotificationLog (decision needs documenting)

## Recent Changes (Audit Implementation — Phase 2)
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
- Add backend view tests for shelter/animal/campaign CRUD
- Integrate Wompi SDK when ready
- Document Notification model divergence decision
- Remove duplicate `docs/e2e-flow-definitions.json`
