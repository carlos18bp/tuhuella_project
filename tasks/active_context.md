# Tuhuella — Active Context

> Last updated: 2026-05-03 (Phase 24 — Adoption Interview Follow-Up + WhatsApp + Event Timeline)

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
- **In-app Manual**: `/{locale}/manual` con ~72 procesos bilingües filtrados por audiencia (`public`, `adopter`, `shelter_admin`, `veterinarian`, `web_manager`, `admin`, `cross`); búsqueda fuzzy con Fuse.js (atajo ⌘K/Ctrl+K); sidebar + ProcessCard; link visible para todo usuario autenticado en el menú de cuenta y el drawer móvil
- **Shelter Application Workflow**: Adopter formaliza postulación a refugio en wizard de 4 pasos (datos básicos / legales / documentos diferidos / motivación); admin/web_manager revisa desde el panel; al aprobar se crea automáticamente el `Shelter` (verified) y el `User.role` cambia a `shelter_admin`; notificaciones a admins al postular y al postulante en aprobación/rechazo
- **Shelter Video**: refugio puede tener un video corto (mp4/webm/mov/ogg) gestionado desde Django admin; en la vista detalle aparece un botón "Ver video" que abre `ShelterVideoModal` con un `<video controls>` HTML5; servido vía el rewrite `/media/*` ya existente
- **Adoption Interview Follow-Up**: cuando una `AdoptionApplication` entra a `interview` se muestra el WhatsApp del refugio al adoptante y el del adoptante al refugio (`Shelter.phone` / `User.phone`, gateado por estado y rol en el serializer). Cada solicitud puede registrar `AdoptionApplicationEvent` (fecha + descripción) por shelter_admin o web_manager; un cron Huey diario (`adoption_interview_follow_ups`, 09:00 UTC) avisa por correo a todos los `web_manager` cada 5 días sobre solicitudes en `interview` y reinicia el temporizador con cada evento o transición de estado

### What's Pending
- **Wompi payment integration**: Views are placeholder stubs
- **Huey periodic tasks**: `scan_stalled_applications` + `scan_follow_ups` deferred until `--periodic` flag on `tuhuella-huey.service` is confirmed (the new `adoption_interview_follow_ups` task ships with the same assumption)
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

## Recently Completed: Phase 24 — Adoption Interview Follow-Up (2026-05-03)

Cierra el estado `interview` de la adopción con tres capacidades complementarias: comunicación directa por WhatsApp entre adoptante y refugio, recordatorios automáticos al `web_manager` cada 5 días, y bitácora de eventos del proceso.

**Backend:**
- New model `AdoptionApplicationEvent` (`models/adoption_event.py`, `ArchivableModel`): FK `application` (CASCADE, related_name='events'), FK `created_by` (PROTECT), `event_date` (no future), `description` (≤2000 chars). `Meta.ordering = ['-event_date', '-created_at']`.
- `AdoptionApplication` extendido con `next_follow_up_due_at` (DateTimeField, db_index=True) y helpers `schedule_follow_up()` / `clear_follow_up()` (`models/adoption.py`).
- Migración `0024_adoption_followup_and_event.py` (AddField + CreateModel).
- Endpoints (`views/adoption.py`, todos `@api_view`): `GET/POST /api/adoptions/<pk>/events/`, `PATCH/DELETE /api/adoptions/<pk>/events/<event_pk>/`. Helpers `_get_application_or_404`, `_can_view_application`, `_can_write_event` consolidan permisos. Lectura: applicant + shelter_admin del refugio + web_manager/admin. Escritura: shelter_admin del refugio + web_manager/admin. Soft-delete vía `archived_at`.
- `application_update_status` ahora llama `schedule_follow_up()` al transicionar a `interview` y `clear_follow_up()` al pasar a `approved`/`rejected`.
- `AdoptionDetailSerializer` extendido con `events`, `next_follow_up_due_at`, `shelter_whatsapp` y `applicant_whatsapp`. Privacidad: ambos números solo se exponen en estados `interview`/`approved`; `applicant_whatsapp` adicionalmente solo a shelter_admin del refugio o web_manager/admin (nunca al adoptante mismo).
- New service `services/adoption_follow_up.py:dispatch_due_follow_ups()` query: `status=interview, archived_at__isnull=True, next_follow_up_due_at__lte=now()`. Para cada match dispara `dispatch_notification('adoption_interview_follow_up_due', web_manager, ctx)` a cada `User.role='web_manager'` activo y reprograma `next_follow_up_due_at = now() + 5 days`.
- New Huey periodic task `adoption_interview_follow_ups` en `base_feature_project/tasks.py` (`crontab(hour='9', minute='0')`) gateada por flag `ADOPTION_FOLLOW_UPS_ENABLED` (settings + `.env.example`, default True; mismo patrón que `BACKUPS_ENABLED`).
- New bilingual template `adoption_interview_follow_up_due` en `notification_templates.py`.
- 21 tests backend pasando (4 model, 11 endpoints, 6 service); factories: nueva `AdoptionApplicationEventFactory`. Admin: `AdoptionApplicationEventAdmin` registrado en sección "Adoption Management".

**Frontend:**
- New types `AdoptionApplicationEvent` + campos `events`/`next_follow_up_due_at`/`shelter_whatsapp`/`applicant_whatsapp` en `AdoptionApplication` (`lib/types.ts`).
- `lib/constants.ts`: `ADOPTION_EVENTS`/`ADOPTION_EVENT_DETAIL` API endpoints + `ROUTES.MY_APPLICATION_DETAIL` y `ROUTES.WEB_MANAGER_APPLICATION_DETAIL`.
- `adoptionStore` extendido con `applicationsById` cache, `fetchApplication`, `createEvent`, `updateEvent`, `archiveEvent`.
- 3 nuevos componentes en `components/adoption/`: `WhatsAppContactCard` (intro + contactName + `wa.me/<digits>?text=…` con sanitización a dígitos), `AdoptionEventTimeline` (lista cronológica con icono por rol del autor), `AdoptionEventCreateModal` (datetime-local + textarea, valida fecha pasada/presente y descripción no vacía).
- New page `/[locale]/my-applications/[id]/page.tsx` (detalle del adoptante: badge de estado, `ApplicationTimeline`, WhatsApp del refugio cuando aplica, timeline read-only, link a `/history`).
- New page `/[locale]/web-manager/applications/[id]/page.tsx` (detalle del web_manager con badge "Próximo recordatorio en N días" cuando `interview` y permisos de creación de evento).
- `/[locale]/shelter/applications/page.tsx`: botón "Detalle" expande inline mostrando WhatsApp del adoptante + `AdoptionEventTimeline` con creación cuando estado en `interview`/`approved`.
- `/[locale]/my-applications/page.tsx`: cada item linkea a `MY_APPLICATION_DETAIL` (antes navegaba al animal).
- `AdminApplicationsTable`: el nombre del animal es ahora un link a `WEB_MANAGER_APPLICATION_DETAIL`.
- i18n: nuevos namespaces `adoption.contact.*`, `adoption.events.*`, `myApplications.detail.*`, `webManager.detail.*`, `webManager.followUp.*` (es+en validados).
- Bug fix colateral en `jest.setup.ts`: el mock de `useTranslations` ahora soporta namespaces con punto (`'adoption.events'`) — antes resolvía solo el primer nivel.
- 5 Jest tests nuevos para `AdoptionEventTimeline` (empty, render, gating de creación, submit con payload normalizado).

**Verification:** `python manage.py check` clean; `pytest test_adoption_event_model.py test_adoption_event_endpoints.py test_adoption_follow_up_service.py -v` → 21 passed; `npm test -- AdoptionEventTimeline.test.tsx` → 5 passed; `tsc --noEmit` sin errores nuevos en archivos modificados; JSON i18n validado en ambos idiomas.

**Operational notes:** post-deploy correr `python manage.py migrate` y reiniciar `tuhuella_project tuhuella-huey tuhuella-frontend`. Asegurar `--periodic` en `tuhuella-huey.service` (mismo prereq que `BACKUPS_ENABLED`). Para apagar la tarea sin desplegar: `ADOPTION_FOLLOW_UPS_ENABLED=False` en `.env` y reiniciar `tuhuella-huey`. Las solicitudes existentes en `interview` quedan fuera del cron hasta que se registre un evento o se re-transicione (no hay backfill automático).

---

## Recently Completed: Phase 23 — Shelter Video on Detail Page (2026-05-03)

Each `Shelter` can now host a short presentation video uploaded by platform staff. On the public detail page (`/[locale]/shelters/[shelterId]`) a "Ver video" button appears below the contact grid (only when a video is present) and opens a modal with an HTML5 `<video controls>` player.

**Backend:**
- `models/shelter.py`: new `video = FileField(upload_to='shelters/videos/', null=True, blank=True, validators=[FileExtensionValidator(['mp4','webm','mov','ogg'])])`. This is the **first plain `FileField` in `base_feature_app`** — all other media goes through `django_attachments` Library/Attachment (`SingleImageField`/`GalleryField`), but a Library is image-oriented (uses `ThumbnailerField` + image_width/height), so for video we sidestep it.
- `Shelter.delete()` extended to call `self.video.delete(save=False)` after the existing Library cleanup.
- Migration `0023_shelter_video.py`: single `AddField` op.
- `serializers/shelter_detail.py`: new `video_url` SerializerMethodField (returns `obj.video.url` or `''`); added to `Meta.fields`. `ShelterListSerializer` and `ShelterCreateUpdateSerializer` are intentionally **not** modified — the video is admin-managed only, mirroring how `logo`/`cover_image`/`gallery` are handled.
- `ShelterAdmin` gets the new field automatically (no `fields`/`fieldsets` override; `AttachmentsAdminMixin` only handles Library-backed fields).
- Tests (19/19 passing): 1 model test (field optionality + `upload_to`), 2 serializer tests (empty case + populated case using `SimpleUploadedFile` with `settings.MEDIA_ROOT = str(tmp_path)` to avoid writing into the real `backend/media/`), 1 endpoint test (asserting `video_url` key is present in `GET /api/shelters/<id>/`).

**Frontend:**
- `lib/types.ts`: `Shelter.video_url?: string`.
- `lib/__tests__/fixtures.ts`: first `mockShelter` now includes `video_url: '/media/shelters/videos/patitas-presentacion.mp4'`; the others stay without to keep the "no video" branch covered.
- `messages/{es,en}.json` (`shelterDetail` namespace): 3 new keys — `playVideo`, `videoModalTitle`, `closeVideo`.
- `components/ui/ShelterVideoModal.tsx` (new): controlled modal mirroring the `TermsModal` pattern (fixed inset overlay with `bg-black/80 backdrop-blur-sm`, click-outside + Escape to close, header with `Film` icon + title, body with `<video controls preload="metadata">` inside an `aspect-video max-w-4xl` container). `useEffect` pauses the video when `open` flips false. Exported from `components/ui/index.ts`.
- `app/[locale]/shelters/[shelterId]/page.tsx`: imports `useState`, `Play` icon, `ShelterVideoModal`. New `videoOpen` state. Conditional teal-gradient "Ver video" button rendered above the gallery section only when `shelter.video_url` is set; modal mounted at the bottom of the component (also gated on `video_url`).
- Tests: 7/7 passing in new `components/ui/__tests__/ShelterVideoModal.test.tsx` (renders `<video src>`, hidden when closed, default vs custom title, backdrop/close-button/Escape close); 18/18 passing in extended `app/[locale]/shelters/[shelterId]/__tests__/page.test.tsx` (button hidden when no `video_url`, click opens modal with the right `src`).

**Verification:** `pytest tests/{models,serializers,views}/test_shelter_*` → 19 passed. Frontend `npm test` for both new/extended files → 7 + 18 passed. Manual: upload an `.mp4` from `/admin-site/`, hit `GET /api/shelters/<id>/` (response carries `video_url: "/media/shelters/videos/<file>.mp4"`), open `/es/shelters/<id>` → button appears → modal plays the file via the `/media/*` rewrite in `next.config.ts`.

**Operational notes:** post-deploy run `python manage.py migrate` and restart `tuhuella_project` + `tuhuella-frontend`. No new env vars; file size is governed by Django's existing `DATA_UPLOAD_MAX_MEMORY_SIZE` and the nginx upload limit on the host.

---

## Recently Completed: Phase 22 — Shelter Application Workflow (2026-05-03)

Adopter users now have a formal "Postularte como refugio" path from `/my-profile` that drives a multi-step application reviewed by admins/web_managers. On approval the system auto-creates a verified `Shelter` and promotes the applicant's role to `shelter_admin`. Replaces the orphan `/shelter/onboarding` flow as the user-facing entrypoint (the old endpoint stays accessible).

**Backend:**
- New model `ShelterApplication` (`models/shelter_application.py`, `ArchivableModel`): applicant FK, shelter basic fields (name/description_es/city/address/phone/email/website), legal fields (legal_name/tax_id/legal_representative_name/legal_representative_id), `documents` `GalleryField` (deferred upload), motivation/previous_experience/capacity_estimate, status (`submitted`/`under_review`/`approved`/`rejected`), `submitted_at`, `reviewed_by`, `reviewed_at`, `rejection_reason`, `created_shelter` OneToOneField to `Shelter`.
- Partial unique constraint `unique_active_shelter_application_per_user` (status in submitted/under_review) — one active application per user; rejected users can re-apply.
- Migration `0022_shelterapplication.py`.
- Serializers: `ShelterApplicationCreateSerializer` (validates no active application + user is not already shelter_admin) and `ShelterApplicationDetailSerializer`.
- Views (`views/shelter_application.py`, all `@api_view`): `POST /api/shelter-applications/` (adopter submits + dispatches `shelter_application_submitted` to all admins/web_managers), `GET /api/shelter-applications/me/` (404→null helper), `GET /api/shelter-applications/<pk>/` (owner or admin), `POST /<pk>/approve/` (atomic: creates `Shelter` VERIFIED + sets `user.role=shelter_admin` + links `created_shelter` + notifies applicant), `POST /<pk>/reject/` (requires `reason` + notifies applicant), `GET /api/shelter-applications/` admin list with `?status=` filter.
- New `urls/shelter_application.py` mounted at `/api/shelter-applications/`.
- 3 new templates in `notification_templates.py`: `shelter_application_submitted`, `shelter_application_approved`, `shelter_application_rejected` (ES + EN).
- Admin: `ShelterApplicationAdmin` registered on `admin_site` with grouped fieldsets (Shelter info / Legal / Documents / Motivation).
- 14 backend tests passing (`tests/models/test_shelter_application_model.py` + `tests/views/test_shelter_application_views.py`): unique-active constraint, re-apply after rejection, adopter submit, anon rejection, duplicate-active rejection, shelter_admin can't apply, `me/` 404 + latest, approve creates verified Shelter + promotes role, adopter can't approve, can't approve already-approved, reject requires reason, reject keeps role unchanged.

**Frontend:**
- `lib/stores/shelterApplicationStore.ts`: Zustand store (`fetchMine` ignores 404, `submit`, `reset`); types `ShelterApplication`, `ShelterApplicationStatus`, `ShelterApplicationPayload`.
- `lib/constants.ts`: `ROUTES.SHELTER_APPLICATION` + `API_ENDPOINTS.SHELTER_APPLICATIONS`/`SHELTER_APPLICATION_MINE`/`SHELTER_APPLICATION_DETAIL`/`SHELTER_APPLICATION_APPROVE`/`SHELTER_APPLICATION_REJECT`.
- `app/[locale]/shelter-application/page.tsx`: 4-step wizard (datos refugio → legales → documentos diferidos → motivación) with `useState<{ step: 1|2|3|4, form }>` pattern; per-step validation; status view when an application already exists (submitted/under_review/approved with "go to dashboard" CTA, rejected with reason + reapply); blocks non-adopter/non-shelter_admin roles.
- `app/[locale]/my-profile/page.tsx`: new "Postularte como refugio" card inserted as **second** item in `adopterActivityLinks` (right after "Mis Solicitudes"); reads `shelterApplication.status` from store and shows dynamic status text via `profile.applyAsShelterStatus_*`; `useEffect` calls `fetchShelterApplication` for adopters.
- `messages/{es,en}.json`: 6 keys in `profile.*` (`applyAsShelter`, `applyAsShelterDesc`, `applyAsShelterStatus_submitted/under_review/approved/rejected`); new `shelterApplication` namespace with wizard chrome (title/subtitle/stepCounter/back/next/submit), per-status copy, field labels, error messages.
- E2E flow tag `SHELTER_APPLICATION` in `e2e/helpers/flow-tags.ts`.
- Tests: 5 Jest unit tests passing (`app/[locale]/shelter-application/__tests__/page.test.tsx`) — wizard mount, step-1 validation block, full 4-step submit + redirect to my-profile, status view for submitted, rejection view + reapply button. Playwright spec `e2e/app/shelter-application.spec.ts` covers redirect-to-sign-in, full happy path with mocked POST, and existing-application status view (not executed live because dev servers were down at implementation time).

**Verification:** `python manage.py check` clean; `pytest test_shelter_application_model.py test_shelter_application_views.py -v` → 14 passed; `npx tsc --noEmit` clean on changed files; `npm test -- shelter-application/__tests__/page.test.tsx` → 5 passed.

**Operational notes:** post-deploy run `python manage.py migrate` and restart `tuhuella_project tuhuella-huey tuhuella-frontend`. The legacy `/shelter/onboarding` page and `POST /api/shelters/create/` endpoint are still reachable but are no longer surfaced from the adopter profile.

---

## Recently Completed: Phase 21.1 — Header Manual link gate aligned with Phase 19 (2026-05-03)

Follow-up a Phase 19. Esa fase abrió la página `/manual` a todos los autenticados (removió `canAccessStaffArea` de `manual/layout.tsx`), pero el **link en el Header** seguía gateado por el mismo helper, así que `adopter`, `shelter_admin` y `veterinarian` no tenían punto de entrada salvo escribir la URL.

**Cambios:**
- `frontend/components/layout/Header.tsx`: eliminada la const `canAccessManual` y ambos guards `{canAccessManual && (...)}` (en `accountContent` y en el drawer móvil). El link al manual se renderiza directo dentro de las ramas ya autenticadas (el dropdown de cuenta solo se monta autenticado; el guard móvil vive dentro del ternario `isAuthenticated ? (...) : (...)`). Removido el import huérfano `canAccessStaffArea` (el helper queda en `lib/auth/permissions.ts` por si aparece un área realmente staff-only).
- Drawer móvil: removido el `text-violet-700` (era un acento "staff" que ya no aplica).
- `frontend/components/layout/__tests__/Header.test.tsx`: añadido `it.each` sobre `[adopter, shelter_admin]` aseverando que el menuitem "Manual" aparece en el dropdown de cuenta, más una aserción del drawer móvil y una negativa para sesión no iniciada. 33/33 tests pasan.

**Verificación:** `npm test -- components/layout/__tests__/Header.test.tsx` → 33 passed.

---

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
