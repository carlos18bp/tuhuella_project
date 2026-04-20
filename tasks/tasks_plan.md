# Tuhuella — Feature Task Plan

> Last updated: 2026-04-20 (Phase 21 — Platform Support 5th Donation Flow)

## Status Legend
- ✅ Done
- 🔧 In Progress
- ⏳ Pending
- ❌ Blocked

## Phase 1 — Backend Models (27 model classes, 24 files)
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

## Phase 2 — Backend Serializers (41 files)
| Task | Status | Notes |
|------|--------|-------|
| 41 serializer files | ✅ | list/detail/create_update pattern + blog + utils |

## Phase 3 — Backend Views, URLs, Admin, Commands
| Task | Status | Notes |
|------|--------|-------|
| 22 view modules | ✅ | FBV pattern |
| 22 URL modules | ✅ | Split under urls/ |
| Admin (MiHuellaAdminSite, 24 classes) | ✅ | All models registered |
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
| types.ts (40 exported types) | �� | |
| constants.ts (routes + API endpoints) | ✅ | |
| 10 Zustand stores | ✅ | Added blogStore, notificationStore |
| next-intl setup (en/es) | ✅ | messages, config, LocaleSwitcher |

## Phase 6 — Frontend Pages & Components
| Task | Status | Notes |
|------|--------|-------|
| 50 page.tsx files | ✅ | All routes covered |
| Header + Footer + Sidebar | ✅ | Role-aware, mobile menu, locale switcher, theme toggle |
| 65 UI components | ✅ | All barrel-exported from components/ui/index.ts |
| Blog components (2) | ✅ | BlogContentRenderer, ReadingProgressBar |
| Provider components | ✅ | ThemeProvider |

## Phase 7 — E2E Flow Mapping
| Task | Status | Notes |
|------|--------|-------|
| flow-definitions.json (75 flows) | ✅ | |
| USER_FLOW_MAP.md | ✅ | |
| E2E test implementation (16 spec files) | 🔧 | Coverage expanding |

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
| Backend tests: 99 files | ✅ | Models, serializers, views, services, utils, commands |
| Frontend unit tests: 289 files | ✅ | Pages, components, stores, hooks, services |
| E2E specs: 17 files | 🔧 | Covers auth, public, app, contract flows |
| E2E flow definitions: 98 flows | ✅ | P1–P4 priority levels |

## Methodology
| Task | Status | Notes |
|------|--------|-------|
| docs/methodology/ (7 core files) | ✅ | Refreshed 2026-03-29 |
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

## Phase 12 — Shelter, Volunteer, Emails & Bug Fixes
| Task | Status | Notes |
|------|--------|-------|
| Bug fix: my-profile not loading (fetchMe in authStore) | ✅ | syncFromCookies + fetchMe + phone/city in validate_token |
| Shelter detail: logo overlay + Swiper gallery | ✅ | ShelterGallery component, cover+logo layout |
| Volunteer application model + migration | ✅ | FK to VolunteerPosition + User, status choices |
| Volunteer application serializer | ✅ | Validates active position, motivation >= 20 chars |
| Volunteer application view + URL | ✅ | POST with IsAuthenticated + reCAPTCHA |
| Volunteer application Django admin | ✅ | In "Voluntariado y Aliados" section |
| Volunteer application frontend form | ✅ | Auto-fill, character counter, success state |
| Volunteer "Postularme" button on cards | ✅ | Link to /work-with-us/apply/[positionId] |
| Volunteer i18n (es + en) | ✅ | 22 new translation keys |
| Branded HTML email base template | ✅ | Teal header, Stone bg, table-based layout |
| Password reset code email template | ✅ | Extends base, code in teal box |
| Verification code email template | ✅ | Extends base, welcome + code |
| Volunteer notification email template | ✅ | Extends base, striped detail table |
| Centralized email_utils.py | ✅ | All email functions + EmailService class |
| Campaign evidence fake data | ✅ | picsum.photos images for completed campaigns |
| S1: reCAPTCHA on volunteer form | ✅ | Same pattern as sign-in/sign-up |
| S2: next/image optimization | ✅ | Shelter detail + campaign detail pages |
| S3: Email function centralization | ✅ | email_utils.py + backwards-compat re-exports |

## Phase 13a — Enriched Favorites View ✅
| Task | Status | Notes |
|------|--------|-------|
| Favorite model — `note` field + migration | ✅ | Optional text note per favorite |
| FavoriteSerializer — 10 enriched fields | ✅ | breed, age_range, size, gender, vaccinated, sterilized, status, shelter_city, thumbnail_url, note |
| PATCH /favorites/{id}/ endpoint | ✅ | Note updates |
| favorite_toggle returns full serialized favorite | ✅ | On add |
| 5 new backend tests | ✅ | Enriched fields, toggle, note CRUD, auth, ownership |
| AnimalCard reuse + status badge overlays | ✅ | adopted=red, in_process=amber, unavailable=grey |
| Remove favorite with inline confirmation | ✅ | |
| Counter + relative date display | ✅ | "Guardado hace X días" |
| Client-side filters (species, size) + sort | ✅ | Chips + dropdown |
| Grid/list toggle with localStorage | ✅ | |
| Personal notes with debounced auto-save | ✅ | |
| Compare mode (2–3 animals) | ✅ | Floating bar + comparison table modal |
| Enhanced empty state | ✅ | Popular animals suggestion |
| 36 i18n keys (es + en) | ✅ | |
| 14 frontend unit tests | ✅ | All passing |

## Phase 13b — Enriched My-Profile Dashboard
| Task | Status | Notes |
|------|--------|-------|
| Step 1: User model — 6 new fields + migration | ⏳ | avatar, bio, housing_type, has_yard, has_other_pets, experience_level |
| Step 2a: validate_token — add date_joined + new fields | ⏳ | Also update generate_auth_tokens |
| Step 2b: GET /user/profile-stats/ endpoint | ⏳ | Aggregated stats from 6 models |
| Step 2c: GET /user/activity/ endpoint | ⏳ | Combined timeline from 4 models |
| Step 2d: PATCH /user/profile/ endpoint | ⏳ | New UserProfileUpdateSerializer |
| Step 2e: POST /user/profile/avatar/ endpoint | ⏳ | MultiPartParser, same as blog cover |
| Step 2f: Register URLs in urls/profile.py | ⏳ | Under /user/ prefix |
| Step 3: Admin — new fieldsets for User | ⏳ | Housing, Experience, Avatar sections |
| Step 4a: Frontend types — User, ProfileStats, ActivityEvent | ⏳ | |
| Step 4b: Frontend constants — API endpoints | ⏳ | |
| Step 4c: Auth store — new actions + state | ⏳ | fetchProfileStats, fetchActivity, updateProfile, uploadAvatar |
| Step 5a: Profile card — avatar, bio, housing, completeness | ⏳ | |
| Step 5b: Activity cards with stats counters | ⏳ | |
| Step 5c: Shelter invites banner | ⏳ | |
| Step 5d: Edit profile modal | ⏳ | Zod validation, multi-section form |
| Step 5e: Activity timeline component | ⏳ | |
| Step 5f: Profile completeness bar | ⏳ | Frontend-only calculation |
| Step 6a: Translations (es + en) | ⏳ | ~50 new keys |
| Step 6b: Backend tests | ⏳ | profile-stats, activity, update-profile |
| Step 6c: Frontend unit tests | ⏳ | page, modal, timeline, store |
| Step 6d: E2E flow updates | ⏳ | Edit profile flow |

## Phase 14 — Adoption, Health, Roles & Post-Adoption Follow-Up (2026-04-19)
| Task | Status | Notes |
|------|--------|-------|
| **Fase 1 — Adoption form pets-at-home** | ✅ | has_pets select + per-type checkboxes with counts; buildFormAnswers() reshapes payload; isPetsBlockValid() |
| Adoption form i18n (sectionPetsAtHome, reviewPets) | ✅ | es + en keys; removed old current_pets/has_cats/has_other_dogs |
| AdoptionForm unit tests (4 new cases) | ✅ | has_pets=no/yes/invalid/submit payload |
| **Fase 2 — Animal health + disease screening** | ✅ | |
| Animal model: is_dewormed, vaccinated_at, sterilized_at, last_vet_checkup, medical_notes_es/en | ✅ | Migration required |
| AnimalDiseaseScreening model | ✅ | disease_key, result tri-state, unique_together (animal, disease_key) |
| DiseaseScreeningSerializer | ✅ | new animal_disease.py |
| animal_detail view: select_related + prefetch_related disease_screenings | ✅ | N+1 fix |
| AnimalDetailSerializer: disease_screenings embedded | ✅ | |
| AnimalAdmin: inline + new health fieldset fields | ✅ | |
| AnimalHealthSection component | ✅ | Color-coded disease grid, health pills, medical notes, vet checkup |
| Animal page: replaced pills with AnimalHealthSection | ✅ | |
| Animal health i18n (healthTitle, diseases.*, result.*) | ✅ | |
| **Fase 3 — Roles + web_manager** | ✅ | |
| User.Role: veterinarian + web_manager | ✅ | Migration (AlterField choices) |
| shelter_access.py helpers: is_web_manager, is_veterinarian, is_admin | ✅ | |
| application_list/detail: web_manager sees all | ✅ | |
| web_manager_views.py: admin_applications_list, shelter_applications_list, admin_shelters_list | ✅ | |
| Signal: adoption_submitted dispatched to all web_managers | ✅ | |
| Notification template: adoption_requires_attention | ✅ | |
| Frontend types: UserRole with 5 values | ✅ | |
| webManagerStore: fetchShelters, fetchApplications, fetchShelterApplications | ✅ | |
| AdminApplicationsTable component | ✅ | |
| web-manager pages: layout (gate), applications, shelters, shelter detail (Info + Applications tabs) | ✅ | |
| Web manager i18n (webManager namespace) | ✅ | |
| **Fase 4 — Post-adoption follow-up + vet workspace** | ✅ | |
| PostAdoptionFollowUp model (ArchivableModel) | ✅ | auto_created on approval via signal, scheduled +30d |
| ClinicalHistoryEntry model | ✅ | entry_type choices, body_es/en, attachment_urls |
| followUpStore: fetchMine, fetchDetail, assignVet, markComplete | ✅ | |
| clinicalHistoryStore: setEntries, fetchForAnimal, addEntry | ✅ | |
| follow_up.py views: scoped list, detail (prefetch clinical_entries), assign, complete, veterinarians_list | ✅ | |
| clinical-history endpoints (GET + POST on /animals/<pk>/clinical-history/) | ✅ | |
| Notification events: follow_up_assigned_to_vet, follow_up_due_soon, follow_up_overdue, clinical_entry_added | ✅ | |
| 4 new bilingual notification templates | ✅ | |
| ClinicalEntryForm component | ✅ | |
| ClinicalHistoryTimeline component (shared vet + adopter) | ✅ | |
| Vet pages: layout (gate), follow-ups list, follow-up detail | ✅ | |
| my-applications/[id]/history page (adopter read-only) | ✅ | |
| Veterinarian i18n namespace | ✅ | |
| PostAdoptionFollowUpAdmin + ClinicalHistoryEntry inline | ✅ | |
| **Pending (deferred)** | ⏳ | |
| Huey periodic task scan_stalled_applications (F3) | ⏳ | Wait to confirm --periodic on tuhuella-huey.service |
| Huey periodic task scan_follow_ups (F4) | ⏳ | Same |
| Web manager shelter detail: "Seguimientos" tab | ⏳ | Follow-up tab wiring to vet assignment |
| Shelter-side animal create/edit UI form | ⏳ | Backend supports it; UI out of scope |

## Phase 15 — Campaign Approval Workflow (2026-04-19)
| Task | Status | Notes |
|------|--------|-------|
| Campaign model: approval_status + submitted_at + reviewed_by + reviewed_at | ✅ | ApprovalStatus TextChoices (pending/approved/rejected), default pending |
| CampaignMessage model | ✅ | FK Campaign+User, is_system, created_at; ordering + index on (campaign, created_at) |
| Migration 0020 + data migration | ✅ | Marks all pre-existing active/completed campaigns as approved |
| campaign_list: filter approval_status=approved for public | ✅ | |
| campaign_create: shelter→pending, web_manager→approved | ✅ | |
| campaign_update: allow web_manager/admin in addition to shelter owner | ✅ | |
| campaign_submit endpoint (POST /campaigns/<id>/submit/) | ✅ | Moves rejected → pending |
| campaign_messages endpoint (GET/POST /campaigns/<id>/messages/) | ✅ | Scope-checked; notifies counterparty |
| campaign_admin.py: admin_campaigns_list, approve, reject | ✅ | Paginated; system message on action |
| CampaignListSerializer + CampaignDetailSerializer: approval fields | ✅ | reviewed_by_name SerializerMethodField |
| CampaignMessageSerializer | ✅ | author_name + author_role |
| 4 notification templates | ✅ | campaign_request_submitted, campaign_approved, campaign_rejected, campaign_new_message |
| Django signal: notify web_managers on pending | ✅ | post_save + pre_save on Campaign |
| CampaignAdmin + CampaignMessageAdmin | ✅ | list_display/filter for approval fields |
| 10 backend tests | ✅ | All passing |
| Frontend types: CampaignApprovalStatus, CampaignMessage, extended Campaign | ✅ | |
| Frontend constants: CAMPAIGNS_MINE, CAMPAIGN_SUBMIT, CAMPAIGN_MESSAGES, ADMIN_CAMPAIGNS, ADMIN_CAMPAIGN_APPROVE/REJECT | ✅ | |
| campaignStore: createCampaign, updateCampaign, submitForApproval, fetchMyCampaigns, fetchMessages, sendMessage | ✅ | messagesByCampaign cache |
| webManagerStore: campaigns, fetchCampaigns, approveCampaign, rejectCampaign | ✅ | |
| shelter/campaigns/page.tsx: approval badges + rejection banners | ✅ | Uses fetchMyCampaigns |
| shelter/campaigns/[id]/page.tsx: edit + resubmit + chat | ✅ | |
| shelter/campaigns/nueva/page.tsx: request form | ✅ | Fetches shelter via owner=me |
| web-manager/campaigns/page.tsx: tabs + list | ✅ | |
| web-manager/campaigns/[id]/page.tsx: approve/reject + chat | ✅ | |
| web-manager/campaigns/new/page.tsx: direct create with shelter selector | ✅ | |
| CampaignMessageThread component | ✅ | Shared; cache-aware; bubble styles by role |
| Frontend TypeScript clean + 20 passing tests | ✅ | |
| **Pending (deferred)** | ⏳ | |
| Campaign closure automation: Huey task for ends_at expiry + goal reached | ⏳ | Needs --periodic confirmed on tuhuella-huey.service |
| i18n extraction for new campaign pages | ⏳ | Hardcoded Spanish strings acceptable for now (consistent with existing patterns) |
| Shared CampaignForm component (shelter/nueva + web-manager/new dedup) | ⏳ | ~150-line duplication; deferred as larger refactor |

## Phase 16 — Interactive In-App Manual (2026-04-19, content rewrite 2026-04-19)
| Task | Status | Notes |
|------|--------|-------|
| `lib/manual/types.ts` — ManualProcess, ManualSection, ManualSearchHit types | ✅ | ManualAudience (7 values), LocalizedText, LocalizedList; `endpoints` field removed in rewrite |
| `lib/manual/content.ts` — 9 sections, ~72 processes, bilingual, non-technical | ✅ | Sections: introduction, getting-started (highlighted), public-views, adopter, shelter, vet, web-manager (highlighted), admin, cross-cutting. All jargon removed (no Django/Huey/JWT/endpoints). |
| `lib/manual/useManualSearch.ts` — Fuse.js hook with useDeferredValue | ✅ | Weights: title 0.5, keywords 0.25, summary 0.15, steps 0.07, route 0.03; max 12 results |
| `lib/auth/permissions.ts` — canAccessStaffArea helper | ✅ | Deduplicates role check across layout + Header |
| `components/manual/RoleBadge.tsx` | ✅ | 7 color-coded audience badges |
| `components/manual/ProcessCard.tsx` | ✅ | Anchor card: title/badge/why/steps/route/tips callout. Endpoints block removed; route section simplified to single `<section>`. |
| `components/manual/ManualSidebar.tsx` | ✅ | Collapsible accordion, mobile toggle + desktop sticky |
| `components/manual/ManualSearch.tsx` | ✅ | Keyboard nav, Cmd/Ctrl+K shortcut, scroll-to-highlight with timer cleanup |
| `app/[locale]/manual/layout.tsx` — role gate | ✅ | useRequireAuth + canAccessStaffArea → AdminAccessDenied (gate removed in Phase 19 — open to all authenticated users) |
| `app/[locale]/manual/page.tsx` — shell | ✅ | Sticky search + sidebar + ProcessCards |
| `messages/{es,en}.json` — manual namespace | ✅ | card.endpoints removed; card.route → "Dónde encontrarlo" / "Where to find it"; card.tips neutral label |
| `package.json` — fuse.js ^7.3.0 | ✅ | |
| Header conditional "Manual" link | ✅ | Violet, BookOpen icon, web_manager/admin/is_staff only |
| 33 Jest tests (layout gate, search hook, search component, ProcessCard, sidebar) | ✅ | All passing |
| Build passes — /[locale]/manual route in output | ✅ | |
| **Pending (optional)** | ⏳ | |
| E2E spec `e2e/app/manual.spec.ts` | ✅ | Basic flows covered (load, search, no-results) |

## Phase 17 — Header UI/UX Overhaul + Responsive Optimization (2026-04-19)
| Task | Status | Notes |
|------|--------|-------|
| `DropdownMenu` primitive (`components/ui/DropdownMenu.tsx`) | ✅ | useId SSR-safe IDs, getTriggerProps ARIA encapsulation, Escape + arrow-key nav, onOpen callback, DropdownDivider |
| Panel dropdown per role (`buildRolePanel`) | ✅ | shelter_admin 7 items, web_manager 3, admin 6, veterinarian plain link, adopter null |
| Avatar dropdown (`accountItems[]`) | ✅ | Mi Perfil, Favoritos, Mis solicitudes, Mis donaciones, Mis apadrinamientos, Notificaciones, Manual (staff), Cerrar sesión |
| `UnreadBadge` local component | ✅ | Extracted from desktop + mobile bell; renders null when count ≤ 0 |
| Mobile notification bell (`lg:hidden`) | ✅ | Link to MY_NOTIFICATIONS with UnreadBadge; shown only when authenticated |
| Breakpoint `md:` → `lg:` (4 occurrences in Header.tsx) | ✅ | Tablets 768–1023 now get mobile drawer |
| Hamburger touch target `p-2` → `p-2.5` | ✅ | WCAG 2.5.5 44×44 compliance |
| Gap polish: `xl:gap-1 2xl:gap-2` public nav, `2xl:gap-3` auth side | ✅ | |
| Mobile drawer: Panel + Mi cuenta section headings | ✅ | accountItems[] reused; role-colored panel section |
| `messages/{es,en}.json` — new nav.* keys | ✅ | panel, account, openAccountMenu, openPanelMenu, myApplications, myDonations, mySponsorships, myNotifications, dashboard, applications, animalsManage, campaignsManage, donations, updates, settings, approveShelters, moderation, payments, metrics, blogAdmin, followUps, sheltersManage |
| Header tests updated (27 → 29 passing) | ✅ | openAccountMenu helper, role panel tests, mobile bell tests, 99+ badge toHaveLength(2) |
| Header.tsx 465 → 610 lines; DropdownMenu.tsx 133 lines | ✅ | TypeScript clean |

## Phase 18 — Auth Security Hardening (2026-04-20)
| Task | Status | Notes |
|------|--------|-------|
| `PasswordResetSendThrottle` (5/hr) + `PasswordResetVerifyThrottle` (10/hr) | ✅ | `@throttle_classes` on `send_passcode` + `verify_passcode_and_reset_password` |
| `SignInThrottle` (10/min) | ✅ | Applied to both `sign_in` and `google_login` |
| `DEFAULT_THROTTLE_RATES` in `settings.py` | ✅ | All three rates env-var overridable |
| `validate_password()` enforcement in password reset | ✅ | After passcode validation — avoids user enumeration |
| `update_last_login(None, user)` in `sign_in` + `google_login` | ✅ | Django standard helper |
| `update_fields=['password']` + `update_fields=['used']` targeted saves | ✅ | |
| `send_passcode` reads locale from request body | ✅ | Passes to `email_utils` |
| English password reset email template (`password_reset_code_en.html`) | ✅ | Extends `base_email.html` |
| `PASSWORD_RESET_EMAIL_LOCALES` dict in `email_utils.py` | ✅ | Locale-aware dispatch; defaults to Spanish |
| `forgot-password/page.tsx`: full i18n + `useLocale()` + locale to API | ✅ | `useTranslations('forgotPassword')` |
| `sign-in/page.tsx`: full i18n + `safeRedirectTarget()` + `?redirect=` param | ✅ | Rejects absolute URLs + `//host` paths |
| `forgotPassword` namespace in `messages/{es,en}.json` (~28 keys) | ✅ | |
| Extended `auth` namespace in `messages/{es,en}.json` (14 keys; removed duplicate `signingIn`) | ✅ | `common.signingIn` reused |
| `authStore.sendPasswordResetCode`: optional `locale` param | ✅ | |
| Backend tests: throttle (monkey-patch `get_rate`), weak password, locale email, `last_login` | ✅ | `_clear_throttle_cache` autouse fixture with `cache.clear()` |
| Frontend sign-in tests: `it.each` redirect safety, i18n assertions | ✅ | |

## Phase 19 — Role Profile Sections + Manual Filtered by Role (2026-04-20)
| Task | Status | Notes |
|------|--------|-------|
| `VeterinarianProfileSection` component | ✅ | Stats from `useFollowUpStore`; fetches on mount if empty; quick action to `/veterinarian/follow-ups` |
| `WebManagerProfileSection` component | ✅ | Parallel `api.get` via local state (not store); 3 stats + 4 quick actions |
| `my-profile/page.tsx`: vet + web_manager headings | ✅ | Role→heading lookup map; `crossActivityLinks` for non-adopters |
| `lib/manual/filterByRole.ts` | ✅ | `canViewManualAudience` + `filterManualSectionsForRole`; web_manager/admin see all |
| `manual/layout.tsx`: removed staff-only gate | ✅ | Now `useRequireAuth()` only — all authenticated users allowed |
| `manual/page.tsx`: filtered sections via `useMemo` | ✅ | `visibleSections` passed to sidebar, search, body |
| `ManualSearch.tsx` + `useManualSearch.ts`: `sections` prop | ✅ | Optional; defaults to `MANUAL_SECTIONS`; search index respects role |
| `manual/layout.test.tsx`: updated assertions | ✅ | `it.each` over all 5 roles; removed denied-access test |
| i18n: `profile.veterinarianResponsibilities`, `profile.webManagerResponsibilities` | ✅ | es + en |
| i18n: `webManager.overviewTitle`, `pendingShelters`, `submittedApplications`, `pendingCampaigns`, `newCampaign` | ✅ | es + en |
| i18n: `manual.eyebrow` neutralized; `manual.accessDenied` + `webManager.totalShelters` removed | ✅ | |
| 58 tests passing | ✅ | Lint clean |

## Phase 20 — Activity Timeline for All Roles (2026-04-20)
| Task | Status | Notes |
|------|--------|-------|
| `user_activity` view: shelter_admin events (animal_added, campaign_created, application_reviewed, donation_received) | ✅ | Filtered by shelter.owner=user; Animal/Campaign/AdoptionApplication/Donation queries |
| `user_activity` view: veterinarian events (clinical_entry, followup_completed) | ✅ | ClinicalHistoryEntry.author + PostAdoptionFollowUp.assigned_vet with completed_date |
| `user_activity` view: web_manager events (campaign_reviewed) | ✅ | Campaign.reviewed_by=user with reviewed_at |
| `user_activity` view: admin events (shelter_verified) | ✅ | Shelter.verified_at set (global — no reviewer FK) |
| `backend/views/profile.py`: new imports ClinicalHistoryEntry, PostAdoptionFollowUp | ✅ | |
| `frontend/lib/types.ts`: ActivityEvent.type union widened 4→12; `campaign_title?` field added | ✅ | |
| `my-profile/page.tsx`: isAdopter gate removed from activity card; fetchActivity() runs for all | ✅ | fetchProfileStats still adopter-only |
| `my-profile/page.tsx`: `showExploreCta` prop on ActivityTimeline; CTA hidden for non-adopters | ✅ | |
| `my-profile/page.tsx`: iconMap + getDescription extended (8 new cases); new icons (Stethoscope, CheckCircle2, PawPrint) | ✅ | |
| `messages/{es,en}.json`: 8 new activity* keys (activityAnimalAdded…activityShelterVerified) | ✅ | |
| Backend check + 23 profile view tests passing; tsc clean on changed files | ✅ | |

## Known Issues
- Wompi payment SDK not integrated (placeholder only)
- Blog posts fake data command fails with `'category'` error (pre-existing, unrelated to Phase 12)
- Huey periodic worker: confirm `tuhuella-huey.service` runs with `--periodic` before adding scan tasks
