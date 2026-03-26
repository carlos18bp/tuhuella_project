# Mi Huella — Feature Task Plan

> Last updated: 2026-03-26

## Status Legend
- ✅ Done
- 🔧 In Progress
- ⏳ Pending
- ❌ Blocked

## Phase 1 — Backend Models (20 models)
| Task | Status | Notes |
|------|--------|-------|
| User model | ✅ | city field, adopter/shelter_admin/admin roles |
| Shelter model | ✅ | logo, cover_image, verification_status |
| Animal model | ✅ | GalleryField, species/age/gender/size enums |
| AdoptionApplication model | ✅ | JSONField form_answers, unique_together |
| Campaign model | ✅ | progress_percentage property |
| Donation model | ✅ | nullable shelter/campaign FKs |
| Sponsorship model | ✅ | monthly/one_time frequency |
| Payment model | ✅ | nullable donation/sponsorship FKs |
| UpdatePost model | ✅ | linked to shelter/campaign/animal |
| AdopterIntent model | ✅ | OneToOne with User |
| ShelterInvite model | ✅ | unique_together shelter+intent |
| Subscription model | ✅ | OneToOne with Sponsorship |
| Favorite model | ✅ | through table |
| Notification (Preference + Log) | ✅ | Split into two models |
| PasswordCode model | ✅ | kept from template |
| BlogPost model | ✅ | bilingual, JSON content, SEO, 10 categories |
| AmountOption model | ✅ | predefined donation/sponsorship amounts |
| FAQ model | ✅ | question/answer pairs |
| StrategicAlly model | ✅ | partner organizations |
| VolunteerPosition model | ✅ | volunteer opportunities |

## Phase 2 — Backend Serializers (40 files)
| Task | Status | Notes |
|------|--------|-------|
| 40 serializer files | ✅ | list/detail/create_update pattern + blog + utils |

## Phase 3 — Backend Views, URLs, Admin, Commands
| Task | Status | Notes |
|------|--------|-------|
| 19 view modules | ✅ | FBV pattern |
| 18 URL modules | ✅ | Split under urls/ |
| Admin (MiHuellaAdminSite, 21 classes) | ✅ | All 20 models registered |
| 21 management commands | ✅ | Including seed_amount_options |
| Payment placeholder views | ✅ | Wompi stub |
| Services (email, notification) | ✅ | 3 service files |

## Phase 4 — Frontend Design System
| Task | Status | Notes |
|------|--------|-------|
| globals.css (stone palette + accents) | ✅ | |
| layout.tsx (Inter font, metadata) | ✅ | |
| Dependencies installed | ✅ | gsap, swiper, framer-motion, etc. |
| GSAP ScrollTrigger integration | ✅ | useScrollReveal hook |
| Swiper gallery integration | ✅ | AnimalGallery component |
| Framer Motion page transitions | ✅ | template.tsx |
| Theme toggle (dark mode) | ✅ | ThemeProvider + ThemeToggle |

## Phase 5 — Frontend Types, Constants, Stores
| Task | Status | Notes |
|------|--------|-------|
| types.ts (34 exported types) | ✅ | |
| constants.ts (routes + API endpoints) | ✅ | |
| 10 Zustand stores | ✅ | Added blogStore, notificationStore |
| next-intl setup (en/es) | ✅ | messages, config, LocaleSwitcher |

## Phase 6 — Frontend Pages & Components
| Task | Status | Notes |
|------|--------|-------|
| 47 page.tsx files | ✅ | All routes covered |
| Header + Footer + Sidebar | ✅ | Role-aware, mobile menu, locale switcher, theme toggle |
| 25 UI components | ✅ | All barrel-exported from components/ui/index.ts |
| Blog components (2) | ✅ | BlogContentRenderer, ReadingProgressBar |
| Provider components | ✅ | ThemeProvider |

## Phase 7 — E2E Flow Mapping
| Task | Status | Notes |
|------|--------|-------|
| flow-definitions.json (75 flows) | ✅ | |
| USER_FLOW_MAP.md | ✅ | |
| E2E test implementation (14 spec files) | 🔧 | Coverage expanding |

## Phase 8 — Cleanup
| Task | Status | Notes |
|------|--------|-------|
| README.md rewrite | ✅ | |
| Fix stale test files | ✅ | helpers.py, test_admin.py, test_urls.py, Role.CUSTOMER |

## Phase 9 — Blog Feature
| Task | Status | Notes |
|------|--------|-------|
| BlogPost model | ✅ | bilingual, JSON content, SEO, 10 categories, 2 authors |
| Blog serializers (7) | ✅ | public + admin patterns |
| Blog views (14 endpoints) | ✅ | public + admin CRUD + utilities |
| Blog URLs | ✅ | public + admin |
| BlogPostAdmin | ✅ | organized fieldsets |
| create_blog_posts command | ✅ | 10 sample posts |
| Frontend blog pages (6) | ✅ | listing, detail, admin list/create/edit/calendar |
| Frontend blog components (2) | ✅ | BlogContentRenderer, ReadingProgressBar |
| blogStore | ✅ | CRUD, calendar, JSON import, cover upload |
| Blog i18n messages | ✅ | en.json, es.json |
| Backend blog tests | ✅ | 8 model + 16 view tests |
| Frontend blog unit tests | ✅ | 54 tests |
| Blog E2E flows + spec | ✅ | 6 flows, blog.spec.ts |

## Phase 10 — Test Coverage Expansion
| Task | Status | Notes |
|------|--------|-------|
| Backend tests: 56 files | ✅ | Models, serializers, views, services, utils, commands |
| Frontend unit tests: 100 files | ✅ | Pages, components, stores, hooks, services |
| E2E specs: 14 files | 🔧 | Covers auth, public, app flows |
| E2E flow definitions: 75 flows | ✅ | P1–P4 priority levels |

## Methodology
| Task | Status | Notes |
|------|--------|-------|
| docs/methodology/ (7 core files) | ✅ | Refreshed 2026-03-26 |
| tasks/ directory | ✅ | |
| Claude Code skills | ✅ | 15+ skills configured |
| Error documentation | ✅ | 4 resolved issues |
| Lessons learned | ✅ | |

## Phase 11 — Methodology Recommendations
| Task | Status | Notes |
|------|--------|-------|
| S1: factory-boy factories (24 classes) | ✅ | factories.py + conftest.py + helpers.py refactored, all tests pass |
| S2: P1 E2E flow coverage audit | ✅ | All 75/75 flows already have @flow: tags |
| S3: Fix CLAUDE.md stale references | ✅ | Removed mirror refs, updated flow count to 75, fixed model/store counts |

## Known Issues
- Wompi payment SDK not integrated (placeholder only)
