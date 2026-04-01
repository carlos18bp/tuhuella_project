# User Flow Map

**Single source of truth for all user flows in Mi Huella.**

Use this document to understand each flow's steps, branching conditions, role restrictions, and API contracts before writing or reviewing E2E tests.

> **Flow IDs in this document match `e2e/flow-definitions.json` and `e2e/helpers/flow-tags.ts` exactly.**

**Version:** 5.0.0
**Last Updated:** 2026-03-31

---

## Table of Contents

1. [Module Index](#module-index)
2. [Home Module](#home-module)
3. [Auth Module](#auth-module)
4. [Animal Module](#animal-module)
5. [Shelter Module (Public)](#shelter-module-public)
6. [Campaign Module](#campaign-module)
7. [Adoption Module](#adoption-module)
8. [Donation Module](#donation-module)
9. [Sponsorship Module](#sponsorship-module)
10. [Favorite Module](#favorite-module)
11. [Adopter Intent Module](#adopter-intent-module)
12. [Adopter Module](#adopter-module)
13. [Shelter Panel Module](#shelter-panel-module)
14. [Admin Module](#admin-module)
15. [Navigation Module](#navigation-module)
16. [Public Module](#public-module)
17. [Blog Module](#blog-module)
18. [Blog Admin Module](#blog-admin-module)
19. [Volunteer Module](#volunteer-module)
20. [Cross-Reference](#cross-reference)

---

## Module Index

**Locale:** Rutas de la app viven bajo `[locale]` (`/es/...`, `/en/...`). Los segmentos de la columna **Frontend Route** coinciden con [`frontend/app/[locale]/`](../frontend/app/[locale]/) (sin prefijo de idioma).

| Flow ID | Name | Module | Priority | Roles | Frontend Route |
|---------|------|--------|----------|-------|----------------|
| `home-loads` | Home page loads | home | P1 | shared | `/` |
| `home-to-animals` | Navigate from home to animals | home | P2 | shared | `/` → `/animals` |
| `home-to-shelters` | Navigate from home to shelters | home | P2 | shared | `/` → `/shelters` |
| `home-to-campaigns` | Navigate from home to campaigns | home | P3 | shared | `/` → `/campaigns` |
| `auth-sign-in-form` | Sign-in form display and interaction | auth | P1 | guest | `/sign-in` |
| `auth-login-invalid` | Login with invalid credentials | auth | P1 | guest | `/sign-in` |
| `auth-sign-up-form` | Sign-up form display and validation | auth | P1 | guest | `/sign-up` |
| `auth-forgot-password-form` | Forgot password form display | auth | P2 | guest | `/forgot-password` |
| `auth-protected-redirect` | Protected route redirect | auth | P1 | shared | any protected route |
| `auth-role-redirect` | Role-based navigation | auth | P2 | adopter, shelter_admin, admin | any page |
| `auth-sign-out` | Sign out | auth | P2 | adopter, shelter_admin, admin | any page |
| `auth-session-persistence` | Session persistence and token refresh | auth | P2 | adopter, shelter_admin, admin | any protected route |
| `auth-google-login` | Google OAuth login | auth | P2 | guest | `/sign-in`, `/sign-up` |
| `animal-browse` | Browse animals listing | animal | P1 | shared | `/animals` |
| `animal-filter` | Filter animals by species/size/age | animal | P2 | shared | `/animals` |
| `animal-detail` | View animal detail | animal | P1 | shared | `/animals/[animalId]` |
| `animal-gallery` | Animal gallery interaction | animal | P3 | shared | `/animals/[animalId]` |
| `shelter-browse` | Browse shelters listing | shelter | P2 | shared | `/shelters` |
| `shelter-detail` | View shelter profile | shelter | P2 | shared | `/shelters/[shelterId]` |
| `shelter-onboarding` | Shelter registration form | shelter | P1 | shelter_admin | `/shelter/onboarding` |
| `campaign-browse` | Browse campaigns | campaign | P2 | shared | `/campaigns` |
| `campaign-detail` | View campaign detail | campaign | P2 | shared | `/campaigns/[campaignId]` |
| `adoption-submit` | Submit adoption application | adoption | P1 | adopter | `/animals/[animalId]` |
| `adoption-track` | Track adoption applications | adoption | P2 | adopter | `/my-applications` |
| `adoption-manage` | Manage adoption applications (shelter) | adoption | P1 | shelter_admin | `/shelter/applications` |
| `donation-checkout` | Donation checkout flow | donation | P1 | adopter | `/checkout/donation` |
| `donation-history` | View donation history | donation | P2 | adopter | `/my-donations` |
| `payment-confirmation` | Payment confirmation page | donation | P2 | adopter | `/checkout/confirmation` |
| `sponsorship-checkout` | Sponsorship checkout flow | sponsorship | P1 | adopter | `/checkout/sponsorship` |
| `sponsorship-history` | View sponsorships | sponsorship | P2 | adopter | `/my-sponsorships` |
| `favorite-toggle` | Toggle animal favorite | favorite | P2 | adopter | `/animals/[animalId]` |
| `favorite-list` | View favorites list | favorite | P2 | adopter | `/favorites` |
| `adopter-intent-create` | Create adopter intent | adopter-intent | P3 | adopter | `/my-intent` |
| `adopter-intent-browse` | Browse adopter intents | adopter-intent | P3 | shared | `/looking-to-adopt` |
| `adopter-profile` | User profile management | adopter | P2 | adopter | `/my-profile` |
| `shelter-panel-dashboard` | Shelter dashboard | shelter-panel | P1 | shelter_admin | `/shelter/dashboard` |
| `shelter-panel-animals` | Shelter manage animals | shelter-panel | P1 | shelter_admin | `/shelter/animals` |
| `shelter-panel-campaigns` | Shelter manage campaigns | shelter-panel | P2 | shelter_admin | `/shelter/campaigns` |
| `shelter-panel-donations` | Shelter view donations | shelter-panel | P2 | shelter_admin | `/shelter/donations` |
| `shelter-panel-settings` | Shelter settings | shelter-panel | P2 | shelter_admin | `/shelter/settings` |
| `admin-dashboard` | Admin dashboard metrics | admin | P1 | admin | `/admin/dashboard` |
| `admin-approve-shelters` | Admin approve/reject shelters | admin | P1 | admin | `/admin/shelters/approve` |
| `admin-moderation` | Admin moderation view | admin | P2 | admin | `/admin/moderation` |
| `admin-metrics` | Admin detailed metrics | admin | P2 | admin | `/admin/metrics` |
| `admin-payments` | Admin payment audit | admin | P2 | admin | `/admin/payments` |
| `navigation-header` | Header navigation | navigation | P2 | shared | all pages |
| `navigation-footer` | Footer navigation | navigation | P4 | shared | all pages |
| `navigation-between-pages` | Cross-page navigation | navigation | P2 | shared | all pages |
| `public-faq` | FAQ page | public | P4 | shared | `/faq` |
| `public-contact` | Contact page | public | P4 | shared | `/contactanos` |
| `shelter-panel-applications` | Shelter manage adoption applications | shelter-panel | P1 | shelter_admin | `/shelter/applications` |
| `adoption-form-wizard` | Adoption form wizard completion | adoption | P1 | adopter | `/adopt/[animalId]` |
| `donation-checkout-submit` | Donation checkout form submission | donation | P1 | adopter | `/checkout/donation` |
| `sponsorship-checkout-submit` | Sponsorship checkout form submission | sponsorship | P1 | adopter | `/checkout/sponsorship` |
| `notification-preferences` | Notification preferences management | adopter | P2 | adopter | `/my-profile/notifications` |
| `notification-bell` | Notification bell interaction | navigation | P2 | adopter, shelter_admin, admin | all pages |
| `shelter-panel-updates` | Shelter manage update posts | shelter-panel | P2 | shelter_admin | `/shelter/updates` |
| `shelter-panel-update-create` | Shelter create update post | shelter-panel | P2 | shelter_admin | `/shelter/updates/create` |
| `shelter-detail-view-animals` | Shelter detail view animals link | shelter | P2 | shared | `/shelters/[shelterId]` |
| `locale-switch` | Locale switcher toggle | navigation | P2 | shared | all pages |
| `campaign-tab-toggle` | Campaign tab toggle | campaign | P3 | shared | `/campaigns` |
| `campaign-donate-cta` | Campaign donate CTA | campaign | P2 | shared | `/campaigns/[campaignId]` |
| `shelter-detail-gallery` | Shelter detail gallery lightbox | shelter | P3 | shared | `/shelters/[shelterId]` |
| `home-featured-animals-carousel` | Home featured animals carousel | home | P3 | shared | `/` |
| `home-active-campaigns-carousel` | Home active campaigns carousel | home | P3 | shared | `/` |
| `public-about` | About page | public | P4 | shared | `/about` |
| `public-terms` | Terms page | public | P4 | shared | `/terms` |
| `public-work-with-us` | Work with us page | public | P4 | shared | `/work-with-us` |
| `public-strategic-allies` | Strategic allies page | public | P4 | shared | `/strategic-allies` |
| `my-applications-list` | View my adoption applications | adoption | P2 | adopter | `/my-applications` |
| `blog-browse` | Blog listing page | blog | P2 | shared | `/blog` |
| `blog-detail` | Blog post detail | blog | P2 | shared | `/blog/[slug]` |
| `blog-admin-list` | Admin blog list | blog-admin | P2 | admin | `/admin/blog` |
| `blog-admin-create` | Admin blog create | blog-admin | P2 | admin | `/admin/blog/crear` |
| `blog-admin-edit` | Admin blog edit | blog-admin | P2 | admin | `/admin/blog/[id]/editar` |
| `blog-admin-calendar` | Admin blog calendar | blog-admin | P3 | admin | `/admin/blog/calendario` |
| `blog-admin-delete` | Admin delete blog post | blog-admin | P2 | admin | `/admin/blog` |
| `blog-admin-duplicate` | Admin duplicate blog post | blog-admin | P3 | admin | `/admin/blog` |
| `volunteer-apply` | Submit volunteer application | volunteer | P2 | shared | `/work-with-us/apply/[positionId]` |
| `profile-edit` | Edit user profile | adopter | P2 | adopter | `/my-profile/edit` |
| `favorites-compare` | Compare favorited animals | favorite | P3 | adopter | `/favorites` |
| `favorite-note-edit` | Edit favorite animal note | favorite | P3 | adopter | `/favorites` |

---

## Home Module

### home-loads

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | shared |
| **Frontend route** | `/` |
| **API endpoints** | `GET /api/animals/`, `GET /api/shelters/`, `GET /api/campaigns/` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/`.
2. Page renders hero section with heading and CTAs for exploring animals, shelters, and campaigns.
3. Featured animals section loads from `GET /api/animals/`.
4. Shelter spotlight section loads from `GET /api/shelters/`.
5. Active campaigns section loads from `GET /api/campaigns/`.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| API unavailable | Sections show empty or skeleton state |

---

### home-to-animals

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/` → `/animales` |

**Steps:**

1. User is on the home page (`/`).
2. User clicks "Explorar Animales" CTA in the hero or featured animals section.
3. User is navigated to `/animales`.

---

### home-to-shelters

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/` → `/refugios` |

**Steps:**

1. User is on the home page (`/`).
2. User clicks shelter spotlight link or CTA.
3. User is navigated to `/refugios`.

---

### home-to-campaigns

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | shared |
| **Frontend route** | `/` → `/campanas` |

**Steps:**

1. User is on the home page (`/`).
2. User clicks active campaigns section link or CTA.
3. User is navigated to `/campanas`.

---

### home-featured-animals-carousel

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | shared |
| **Frontend route** | `/` |

**Preconditions:** None.

**Steps:**

1. User is on the home page (`/`).
2. Featured animals carousel renders with AnimalCard components.
3. User clicks next/prev arrows or swipe gestures to navigate cards.
4. User clicks an animal card and is navigated to `/animales/[id]`.

---

### home-active-campaigns-carousel

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | shared |
| **Frontend route** | `/` |

**Preconditions:** None.

**Steps:**

1. User is on the home page (`/`).
2. Active campaigns carousel renders with CampaignCard components.
3. User clicks next/prev arrows or swipe gestures to navigate cards.
4. User clicks a campaign card and is navigated to `/campanas/[id]`.

---

## Auth Module

### auth-sign-in-form

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | guest |
| **Frontend route** | `/sign-in` |
| **API endpoints** | `POST /api/auth/sign_in/` |

**Preconditions:** User is not authenticated. A registered account exists.

**Steps:**

1. User navigates to `/sign-in`.
2. Page renders form with **Email**, **Password** fields and **Sign in** button.
3. User fills in email and password.
4. User clicks **Sign in**.
5. Frontend sends `POST /api/auth/sign_in/` with `{ email, password }`.
6. Backend validates credentials and returns `{ access, refresh }` (HTTP 200).
7. Frontend stores tokens in cookies (`access_token`, `refresh_token`).
8. Frontend redirects to `/` or the originally requested page.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| Empty email or password | HTML `required` prevents submission |
| Account inactive | `403 { error: "Account is inactive" }` — error below form |

---

### auth-login-invalid

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | guest |
| **Frontend route** | `/sign-in` |
| **API endpoints** | `POST /api/auth/sign_in/` |

**Preconditions:** User is not authenticated.

**Steps:**

1. User navigates to `/sign-in`.
2. User fills in invalid email/password combination.
3. User clicks **Sign in**.
4. Backend returns `401 { error: "Invalid credentials" }`.
5. Error message displayed below the form.
6. User stays on `/sign-in`.

---

### auth-sign-up-form

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | guest |
| **Frontend route** | `/sign-up` |
| **API endpoints** | `POST /api/auth/sign_up/` |

**Preconditions:** User is not authenticated.

**Steps:**

1. User navigates to `/sign-up`.
2. Page renders form: **First Name**, **Last Name**, **Email**, **Password**, **Confirm Password**, **Create account** button.
3. User fills in all fields.
4. User clicks **Create account**.
5. Frontend validates passwords match and length >= 8.
6. Frontend sends `POST /api/auth/sign_up/` with `{ email, password, first_name, last_name }`.
7. Backend creates user and returns `{ access, refresh }` (HTTP 201).
8. Frontend stores tokens and redirects to `/`.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| Passwords do not match | Client error: "Passwords do not match" — no API call |
| Password < 8 chars | Client error: "Password must be at least 8 characters" — no API call |
| Email already registered | `400 { error: "User with this email already exists" }` |
| Missing email or password | `400 { error: "Email and password are required" }` |

---

### auth-forgot-password-form

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | guest |
| **Frontend route** | `/forgot-password` |
| **API endpoints** | `POST /api/auth/send_passcode/`, `POST /api/auth/verify_passcode_and_reset_password/` |

**Preconditions:** User is not authenticated. A registered account exists.

**Step A — Request passcode:**

1. User navigates to `/forgot-password`.
2. Page renders email input and **Send verification code** button (step = `email`).
3. User enters email and clicks **Send verification code**.
4. Frontend sends `POST /api/auth/send_passcode/` with `{ email }`.
5. Backend generates a `PasswordCode`, sends email with 6-digit code.
6. Success message: "Verification code sent to your email". UI transitions to step = `code`.

**Step B — Reset password:**

7. Page renders **Code** (6-digit), **New Password**, **Confirm New Password** fields and **Reset password** button.
8. User enters code and new password.
9. Frontend validates passwords match and length >= 8.
10. Frontend sends `POST /api/auth/verify_passcode_and_reset_password/` with `{ email, code, new_password }`.
11. Backend verifies code, updates password, marks code as used. Returns HTTP 200.
12. Success message: "Password reset successfully! Redirecting..." — redirect to `/sign-in`.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| Email not registered | API still returns `200 { message: "If the email exists, a code has been sent" }` (no leak) |
| Email send failure | `500 { error: "Failed to send email" }` |
| Invalid or expired code | `400 { error: "Invalid or expired code" }` |
| Passwords do not match | Client error — no API call |
| Password < 8 chars | Client error — no API call |
| "Back to email" clicked | UI returns to step A |

---

### auth-protected-redirect

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | shared |
| **Frontend route** | any protected route |

**Preconditions:** User is NOT authenticated (no tokens in cookies).

**Steps:**

1. Unauthenticated user navigates to a protected route (e.g., `/favoritos`, `/refugio/dashboard`).
2. `useRequireAuth()` hook detects missing tokens.
3. User is redirected to `/sign-in`.

---

### auth-role-redirect

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter, shelter_admin, admin |
| **Frontend route** | any page |

**Preconditions:** User is authenticated.

**Steps:**

1. Authenticated user loads any page.
2. Header renders role-specific navigation links:
   - **adopter**: Favoritos, Mis Solicitudes, Mis Donaciones, Mis Apadrinamientos
   - **shelter_admin**: Panel Refugio (with sub-nav to dashboard, animales, etc.)
   - **admin**: Admin panel links (Dashboard, Aprobar Refugios, etc.)

---

### auth-sign-out

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter, shelter_admin, admin |
| **Frontend route** | any page |
| **API endpoints** | None (client-side only) |

**Preconditions:** User is authenticated.

**Steps:**

1. User clicks **Sign out** button in header.
2. Frontend clears JWT tokens from cookies via `authStore.signOut()`.
3. User is redirected to `/sign-in` by the auth guard.

---

### auth-session-persistence

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter, shelter_admin, admin |
| **Frontend route** | any protected route |
| **API endpoints** | `GET /api/auth/validate_token/`, `POST /api/token/refresh/` |

**Preconditions:** User has valid tokens in cookies.

**Steps:**

1. User navigates to a protected route.
2. Frontend reads `access_token` from cookies.
3. Frontend sends `GET /api/auth/validate_token/` with Bearer token.
4. Backend validates JWT and returns `{ valid: true, user: { id, email, first_name, last_name, role, is_staff } }`.
5. User is shown the protected content.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No tokens in cookies | Redirect to `/sign-in` via `useRequireAuth` hook |
| Access token expired | Frontend calls `POST /api/token/refresh/` with refresh token |
| Refresh token expired | Redirect to `/sign-in` |

---

### auth-google-login

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | guest |
| **Frontend route** | `/sign-in`, `/sign-up` |
| **API endpoints** | `POST /api/auth/google_login/` |

**Preconditions:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env var is set. User is not authenticated.

**Steps:**

1. User navigates to `/sign-in` or `/sign-up`.
2. Google Sign-In button rendered via `@react-oauth/google`.
3. User clicks Google button and completes OAuth consent.
4. Frontend receives credential JWT, decodes `email`, `given_name`, `family_name`, `picture`.
5. Frontend sends `POST /api/auth/google_login/` with `{ credential, email, given_name, family_name, picture }`.
6. Backend validates token via Google tokeninfo, gets or creates user.
7. Backend returns `{ access, refresh, created, google_validated }` (HTTP 200).
8. Frontend stores tokens and redirects to `/`.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` missing | "Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID" shown instead of button |
| Credential missing | `400 { error: "Google credential is required" }` |
| Invalid credential (prod) | `401 { error: "Invalid Google credential" }` |
| Audience mismatch (prod) | `401 { error: "Invalid Google client" }` |
| New user | User created with unusable password; `created: true` |
| Existing user | Matched by email; names updated if blank |

---

## Animal Module

### animal-browse

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | shared |
| **Frontend route** | `/animales` |
| **API endpoints** | `GET /api/animals/` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/animales`.
2. Page displays animal cards grid with loading skeletons.
3. Frontend fetches `GET /api/animals/` via `animalStore.fetchAnimals()`.
4. Each card shows name, species, breed, age, shelter, and thumbnail.
5. Each card links to `/animales/[id]`.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| API loading | Skeleton grid shown |
| No animals | Empty state message |

---

### animal-filter

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/animales` |
| **API endpoints** | `GET /api/animals/?species=...&size=...&age_range=...` |

**Preconditions:** User is on `/animales`.

**Steps:**

1. User applies filters (species, size, age_range, gender) via filter controls.
2. Frontend sends filtered `GET /api/animals/` request.
3. Grid updates with filtered results.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No results for filter | Empty state with "No animals match your filters" |
| Reset filters | Grid returns to unfiltered view |

---

### animal-detail

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | shared |
| **Frontend route** | `/animales/[id]` |
| **API endpoints** | `GET /api/animals/<id>/` |

**Preconditions:** Animal with given ID exists.

**Steps:**

1. User clicks an animal card or navigates to `/animales/[id]`.
2. Page renders animal info (name, species, breed, age, size, description, health status).
3. Gallery images displayed via Swiper carousel.
4. CTAs: **Solicitar adopción**, **Apadrinar**, **Agregar a favoritos**.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| Not authenticated | Adoption/sponsorship CTAs redirect to `/sign-in` |
| Animal already favorited | Heart icon shows filled state |
| Animal status `adopted` | Adoption CTA disabled |

---

### animal-gallery

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | shared |
| **Frontend route** | `/animales/[id]` |

**Preconditions:** Animal detail page is loaded. Animal has gallery images.

**Steps:**

1. Gallery section renders with Swiper carousel.
2. User can swipe/click through images.
3. Pagination bullets indicate current position.

---

## Shelter Module (Public)

### shelter-browse

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/refugios` |
| **API endpoints** | `GET /api/shelters/` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/refugios`.
2. Page displays shelter cards grid.
3. Each card shows name, city, verification badge, and description.
4. Each card links to `/refugios/[id]`.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| API loading | Skeleton grid shown |
| No shelters | Empty state message |

---

### shelter-detail

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/refugios/[id]` |
| **API endpoints** | `GET /api/shelters/<id>/`, `GET /api/animals/?shelter=<id>`, `GET /api/campaigns/?shelter=<id>` |

**Preconditions:** Shelter with given ID exists.

**Steps:**

1. User clicks a shelter card or navigates to `/refugios/[id]`.
2. Page renders shelter profile: name, legal name, description, city, contact info, verification badge.
3. Shelter's animals section loads.
4. Shelter's campaigns section loads.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| Shelter not verified | No verification badge shown |
| No animals | "No animals yet" empty state |
| No campaigns | "No campaigns yet" empty state |

---

### shelter-onboarding

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/onboarding` |
| **API endpoints** | `POST /api/shelters/create/` |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/refugio/onboarding`.
2. Form renders: name (required), legal_name, description, city (required), address, phone, email, website.
3. User fills form and submits.
4. Frontend sends `POST /api/shelters/create/` with form data.
5. Backend creates `Shelter` with `verification_status=pending` (HTTP 201).
6. Redirect to `/refugio/dashboard`.

---

### shelter-detail-view-animals

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/refugios/[id]` |
| **API endpoints** | `GET /api/animals/?shelter=<id>` |

**Preconditions:** Shelter with given ID exists and has published animals.

**Steps:**

1. User is on shelter detail page (`/refugios/[id]`).
2. User clicks **View Animals** button.
3. User is navigated to `/animales` with shelter filter applied.
4. Animal listing shows only animals belonging to that shelter.

---

### shelter-detail-gallery

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | shared |
| **Frontend route** | `/refugios/[id]` |

**Preconditions:** Shelter has gallery images.

**Steps:**

1. User is on shelter detail page.
2. Gallery section renders shelter images in a grid.
3. User clicks an image to open lightbox modal.
4. Lightbox displays full-size image.
5. User clicks outside image or X button to close lightbox.

---

## Campaign Module

### campaign-browse

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/campanas` |
| **API endpoints** | `GET /api/campaigns/` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/campanas`.
2. Page displays campaign cards with progress bars.
3. Each card shows title, shelter name, goal amount, raised amount, and progress percentage.
4. Each card links to `/campanas/[id]`.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| API loading | Skeleton grid shown |
| No campaigns | Empty state message |

---

### campaign-detail

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/campanas/[id]` |
| **API endpoints** | `GET /api/campaigns/<id>/`, `GET /api/updates/?campaign=<id>` |

**Preconditions:** Campaign with given ID exists.

**Steps:**

1. User clicks a campaign card or navigates to `/campanas/[id]`.
2. Page renders campaign info: title, description, shelter name, progress bar, dates.
3. Donation CTA button visible.
4. Updates feed section loads related update posts.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| Not authenticated | Donate CTA redirects to `/sign-in` |
| Campaign completed | Donate CTA disabled, "Goal reached" badge shown |

---

### campaign-tab-toggle

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | shared |
| **Frontend route** | `/campanas` |
| **API endpoints** | `GET /api/campaigns/` |

**Preconditions:** None.

**Steps:**

1. User is on campaigns listing page (`/campanas`).
2. Page shows Active and Completed tab toggle.
3. By default, Active tab is selected showing active campaigns.
4. User clicks Completed tab.
5. Listing updates to show only completed campaigns.
6. User clicks Active tab to return to active campaigns.

---

### campaign-donate-cta

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/campanas/[id]` → `/checkout/donacion` |

**Preconditions:** Campaign exists and is active. User is authenticated.

**Steps:**

1. User is on campaign detail page (`/campanas/[id]`).
2. User clicks **Donate** CTA button.
3. User is navigated to `/checkout/donacion` with campaign context (campaign ID pre-filled).

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| Not authenticated | Redirects to `/sign-in` |

---

## Adoption Module

### adoption-submit

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | adopter |
| **Frontend route** | `/animales/[id]` |
| **API endpoints** | `POST /api/adoptions/create/` |

**Preconditions:** User is authenticated. Animal status is `published`.

**Steps:**

1. User clicks **Solicitar adopción** on animal detail page.
2. Adoption form displays with questionnaire fields.
3. User fills form and submits.
4. Frontend sends `POST /api/adoptions/create/` with `{ animal, form_answers, notes }`.
5. Backend creates `AdoptionApplication` with status `submitted` (HTTP 201).
6. Success message shown; user can track at `/mis-solicitudes`.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| User already applied for this animal | `400` error — "Application already exists" |
| Animal status not `published` | Adoption CTA disabled |

---

### adoption-track

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/mis-solicitudes` |
| **API endpoints** | `GET /api/adoptions/` |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/mis-solicitudes`.
2. Page loads user's adoption applications via `GET /api/adoptions/`.
3. Each application shows animal name, shelter name, status badge, and submission date.
4. Status badges: Submitted (blue), Reviewing (amber), Interview (purple), Approved (green), Rejected (red).

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No applications | Empty state: "No has enviado solicitudes aún" |
| API loading | Loading spinner |

---

### adoption-manage

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/solicitudes` |
| **API endpoints** | `GET /api/adoptions/`, `PATCH /api/adoptions/<id>/status/` |

**Preconditions:** User is authenticated as shelter_admin. Shelter owns the animals with applications.

**Steps:**

1. Shelter admin navigates to `/refugio/solicitudes`.
2. Page loads applications for shelter's animals.
3. Each application shows applicant email, animal name, status, submission date.
4. Admin clicks status action buttons: **Revisar** → **Entrevista** → **Aprobar** / **Rechazar**.
5. Frontend sends `PATCH /api/adoptions/<id>/status/` with `{ status }`.
6. Application status updates in the list.

---

### adoption-form-wizard

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | adopter |
| **Frontend route** | `/adopt/[animalId]` |
| **API endpoints** | `POST /api/adoptions/create/` |

**Preconditions:** User is authenticated with `adopter` role. Animal exists with `published` status.

**Steps:**

1. User clicks **Solicitar adopción** on animal detail page.
2. Adoption wizard opens at Step 1 (Questionnaire) with 6 sections:
   - Basic Info: full name, phone, email, city (required).
   - Home & Context: housing type, yard, hours alone.
   - Experience: previous pets, current pets, experience level.
   - Compatibility: children, children ages, cats, other dogs.
   - Commitment: vaccination, sterilization, follow-up checkboxes (required).
   - Logistics: availability date, transport, delivery preference, motivation.
3. User fills all required fields and clicks **Continue**.
4. Step 2 (Review) displays read-only summary of answers by section.
5. User reviews and clicks **Continue**.
6. Step 3 (Submit) shows optional notes textarea and **Submit** button.
7. User optionally adds notes and clicks **Submit**.
8. Frontend sends `POST /api/adoptions/create/` with `{ animal, form_answers, notes }`.
9. Backend creates `AdoptionApplication` with `status=submitted` (HTTP 201).
10. Success message displayed.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| Required fields missing | Form validation prevents advancing to next step |
| Commitment checkboxes unchecked | Cannot proceed past questionnaire |
| API error | Error message shown, form remains on submit step |

---

### my-applications-list

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/mis-solicitudes` |
| **API endpoints** | `GET /api/adoptions/` |

**Preconditions:** User is authenticated with `adopter` role.

**Steps:**

1. User navigates to `/mis-solicitudes`.
2. Page loads adoption applications from `GET /api/adoptions/`.
3. Each application card shows animal name, shelter name, submission date, and status badge.
4. Status badges display: Submitted, Reviewing, Interview, Approved, Rejected.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No applications | Empty state message shown |

---

## Donation Module

### donation-checkout

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | adopter |
| **Frontend route** | `/checkout/donacion` |
| **API endpoints** | `POST /api/payments/create-intent/` (placeholder) |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/checkout/donacion` (from campaign or shelter).
2. Page shows preset amounts, custom amount input, payment method selector.
3. Placeholder banner indicates Wompi integration is not yet active.
4. User selects amount and payment method, clicks **Donar**.
5. Simulated processing (1.5s delay).
6. Redirect to `/checkout/confirmacion?type=donation&status=placeholder`.

---

### donation-history

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/mis-donaciones` |
| **API endpoints** | `GET /api/donations/` |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/mis-donaciones`.
2. Page loads user's donations via `GET /api/donations/`.
3. Each donation shows amount, target (shelter or campaign), status badge, and date.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No donations | Empty state: "No has realizado donaciones aún" |
| API loading | Loading spinner |

---

### payment-confirmation

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/checkout/confirmacion` |

**Preconditions:** User was redirected from donation or sponsorship checkout.

**Steps:**

1. User lands on `/checkout/confirmacion` with query params (`type`, `status`).
2. Page shows confirmation message based on payment type and status.
3. Links to view history (`/mis-donaciones` or `/mis-apadrinamientos`) and return to home.

---

### donation-checkout-submit

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | adopter |
| **Frontend route** | `/checkout/donacion` |
| **API endpoints** | `POST /api/donations/create/`, `POST /api/payments/create-intent/` |

**Preconditions:** User is authenticated with `adopter` role.

**Steps:**

1. User navigates to `/checkout/donacion`.
2. Page renders preset donation amount buttons (e.g., 10,000 / 50,000 COP) and custom amount input.
3. User selects a preset amount or enters custom amount.
4. User selects payment method: Tarjeta (card), PSE, or Nequi.
5. User optionally enters a message in the textarea.
6. Amount summary updates dynamically.
7. User clicks **Submit** / **Donar** button.
8. Frontend sends `POST /api/donations/create/` followed by `POST /api/payments/create-intent/`.
9. Payment provider (Wompi) processes the transaction.
10. User is redirected to `/checkout/confirmacion` with status.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No amount selected | Submit button disabled |
| No payment method selected | Submit button disabled |
| Payment fails | Error message shown, user remains on checkout |

---

## Sponsorship Module

### sponsorship-checkout

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | adopter |
| **Frontend route** | `/checkout/apadrinamiento` |
| **API endpoints** | `POST /api/payments/create-intent/` (placeholder) |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/checkout/apadrinamiento` (from animal detail page).
2. Page shows amount input, frequency selector (monthly/one-time), payment method selector.
3. Placeholder banner indicates Wompi integration is not yet active.
4. User selects amount, frequency, and payment method, clicks **Apadrinar**.
5. Simulated processing (1.5s delay).
6. Redirect to `/checkout/confirmacion?type=sponsorship&status=placeholder`.

---

### sponsorship-history

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/mis-apadrinamientos` |
| **API endpoints** | `GET /api/sponsorships/` |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/mis-apadrinamientos`.
2. Page loads user's sponsorships via `GET /api/sponsorships/`.
3. Each sponsorship shows animal name, amount, frequency, status badge, and start date.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No sponsorships | Empty state: "No tienes apadrinamientos activos" |
| API loading | Loading spinner |

---

### sponsorship-checkout-submit

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | adopter |
| **Frontend route** | `/checkout/apadrinamiento` |
| **API endpoints** | `POST /api/sponsorships/create/`, `POST /api/payments/create-intent/` |

**Preconditions:** User is authenticated with `adopter` role.

**Steps:**

1. User navigates to `/checkout/apadrinamiento`.
2. Page renders frequency selector: Monthly / One-time toggle.
3. User selects frequency.
4. Preset sponsorship amount buttons displayed. User selects preset or enters custom amount.
5. User selects payment method: Tarjeta (card), PSE, or Nequi.
6. Submit button shows selected amount and frequency.
7. User clicks **Submit** button.
8. Frontend sends `POST /api/sponsorships/create/` followed by `POST /api/payments/create-intent/`.
9. Payment provider processes the transaction.
10. User is redirected to `/checkout/confirmacion` with status.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No amount selected | Submit button disabled |
| No payment method selected | Submit button disabled |
| Payment fails | Error message shown |

---

## Favorite Module

### favorite-toggle

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/animales/[id]` |
| **API endpoints** | `POST /api/favorites/toggle/` |

**Preconditions:** User is authenticated.

**Steps:**

1. User is on animal detail page.
2. User clicks the heart/favorite icon.
3. Frontend sends `POST /api/favorites/toggle/` with `{ animal }`.
4. Backend creates or deletes the Favorite record.
5. Heart icon toggles between filled (favorited) and outline (not favorited).

---

### favorite-list

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/favoritos` |
| **API endpoints** | `GET /api/favorites/` |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/favoritos`.
2. Page loads user's favorited animals via `GET /api/favorites/`.
3. Each favorite shows animal name, species, shelter name.
4. User can click to view animal detail or remove from favorites.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No favorites | Empty state: "No tienes favoritos aún" |

---

## Adopter Intent Module

### adopter-intent-create

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | adopter |
| **Frontend route** | `/mi-intencion` |
| **API endpoints** | `POST /api/adopter-intents/create/`, `GET /api/adopter-intents/me/` |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/mi-intencion`.
2. If intent exists, page loads current intent via `GET /api/adopter-intents/me/`.
3. If no intent, form renders with preferences (JSON), description, visibility fields.
4. User fills or updates form and submits.
5. Frontend sends `POST /api/adopter-intents/create/` with form data.
6. Success message shown.

---

### adopter-intent-browse

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | shared |
| **Frontend route** | `/busco-adoptar` |
| **API endpoints** | `GET /api/adopter-intents/` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/busco-adoptar`.
2. Page loads public adopter intents via `GET /api/adopter-intents/`.
3. Each intent card shows user name, preferences summary, description, status.
4. Shelter admins can view intents and send invitations.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No public intents | Empty state message |

---

## Adopter Module

### adopter-profile

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/mi-perfil` |
| **API endpoints** | `GET /api/auth/validate_token/`, `PATCH /api/auth/update_profile/` |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/mi-perfil`.
2. Page loads current user info from auth store.
3. Form displays: first name, last name, phone, city.
4. User edits fields and submits.
5. Profile updates and success message shown.

---

### notification-preferences

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/my-profile/notifications` |
| **API endpoints** | `GET /api/notifications/preferences/`, `PUT /api/notifications/preferences/update/` |

**Preconditions:** User is authenticated with `adopter` role.

**Steps:**

1. User navigates to `/my-profile/notifications`.
2. Page loads notification preferences from `GET /api/notifications/preferences/`.
3. Preferences display toggle switches for each notification event group (email, in-app channels).
4. User toggles a preference switch.
5. Frontend sends `PUT /api/notifications/preferences/update/` with updated preferences.
6. Success confirmation shown.

---

## Shelter Panel Module

### shelter-panel-dashboard

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/dashboard` |
| **API endpoints** | `GET /api/shelters/` |

**Preconditions:** User is authenticated as shelter_admin and owns a shelter.

**Steps:**

1. User navigates to `/refugio/dashboard`.
2. Page loads shelter info and displays verification status badge.
3. Navigation cards to: Animales, Solicitudes, Campañas, Donaciones, Configuración.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No shelter registered | Message + link to `/refugio/onboarding` |
| Shelter pending | Amber "Pendiente de verificación" badge |
| Shelter verified | Green "Verificado" badge |

---

### shelter-panel-animals

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/animales` |
| **API endpoints** | `GET /api/animals/`, `POST /api/animals/create/`, `PATCH /api/animals/<id>/update/`, `DELETE /api/animals/<id>/delete/` |

**Preconditions:** User is authenticated as shelter_admin.

**Steps:**

1. Shelter admin navigates to `/refugio/animales`.
2. Page loads shelter's animals list with status filters.
3. Admin can create new animals, edit existing ones, or change status (draft → published → archived).
4. Each animal card shows name, species, status badge, and action buttons.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No animals | Empty state + "Agregar animal" CTA |
| Filters applied | List updates with filtered results |

---

### shelter-panel-campaigns

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/campanas` |
| **API endpoints** | `GET /api/campaigns/`, `POST /api/campaigns/create/`, `PATCH /api/campaigns/<id>/update/` |

**Preconditions:** User is authenticated as shelter_admin.

**Steps:**

1. Shelter admin navigates to `/refugio/campanas`.
2. Page loads shelter's campaigns with progress bars.
3. Admin can create new campaigns or update existing ones.
4. Each campaign shows title, status, goal, raised amount, and progress.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No campaigns | Empty state + "Crear campaña" CTA |

---

### shelter-panel-donations

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/donaciones` |
| **API endpoints** | `GET /api/donations/` |

**Preconditions:** User is authenticated as shelter_admin.

**Steps:**

1. Shelter admin navigates to `/refugio/donaciones`.
2. Page loads donations received by the shelter.
3. Each donation shows donor (anonymized or email), amount, status, campaign (if any), and date.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No donations | Empty state message |

---

### shelter-panel-settings

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/configuracion` |
| **API endpoints** | `GET /api/shelters/<id>/`, `PATCH /api/shelters/<id>/update/` |

**Preconditions:** User is authenticated as shelter_admin and owns a shelter.

**Steps:**

1. Shelter admin navigates to `/refugio/configuracion`.
2. Page loads current shelter info.
3. Form displays: name, legal name, description, city, address, phone, email, website.
4. Admin edits fields and submits.
5. Shelter info updates and success message shown.

---

### shelter-panel-applications

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/solicitudes` |
| **API endpoints** | `GET /api/adoptions/`, `PUT /api/adoptions/<id>/status/` |

**Preconditions:** User is authenticated with `shelter_admin` role. Shelter has received adoption applications.

**Steps:**

1. Shelter admin navigates to `/refugio/solicitudes`.
2. Page loads applications for the shelter from `GET /api/adoptions/`.
3. Each application card shows applicant email, animal name, status badge, submission date.
4. Admin clicks status action buttons: **Revisar** → **Entrevista** → **Aprobar** / **Rechazar**.
5. Frontend sends `PUT /api/adoptions/<id>/status/` with `{ status }`.
6. Application status updates in the list.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No applications | Empty state message shown |
| Status already final (approved/rejected) | No further action buttons |

---

### shelter-panel-updates

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/updates` |
| **API endpoints** | `GET /api/updates/`, `DELETE /api/updates/<id>/delete/` |

**Preconditions:** User is authenticated with `shelter_admin` role.

**Steps:**

1. Shelter admin navigates to `/refugio/updates`.
2. Page loads update posts from `GET /api/updates/`.
3. Each post card shows title, content preview, creation date.
4. Admin can click **Create** button to navigate to `/refugio/updates/create`.
5. Admin can delete a post by clicking delete action.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| No update posts | Empty state message shown |

---

### shelter-panel-update-create

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shelter_admin |
| **Frontend route** | `/refugio/updates/create` |
| **API endpoints** | `POST /api/updates/create/` |

**Preconditions:** User is authenticated with `shelter_admin` role.

**Steps:**

1. Shelter admin navigates to `/refugio/updates/create`.
2. Form renders: title, content, optional campaign/animal association, image upload.
3. Admin fills form fields.
4. Admin clicks **Publish** / **Submit** button.
5. Frontend sends `POST /api/updates/create/` with form data.
6. Backend creates update post (HTTP 201).
7. Redirect to `/refugio/updates`.

---

## Admin Module

### admin-dashboard

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | admin |
| **Frontend route** | `/admin/dashboard` |
| **API endpoints** | `GET /api/admin/dashboard/` |

**Preconditions:** User is authenticated with `role=admin`.

**Steps:**

1. User navigates to `/admin/dashboard`.
2. Page loads platform metrics (users, shelters, animals, applications, campaigns, donations, sponsorships).
3. Quick action links to: Aprobar Refugios, Moderación, Auditoría de Pagos, Métricas.

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| Not admin | "Acceso denegado" message |

---

### admin-approve-shelters

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Roles** | admin |
| **Frontend route** | `/admin/refugios/aprobar` |
| **API endpoints** | `GET /api/admin/shelters/pending/`, `POST /api/admin/shelters/approve/<id>/` |

**Preconditions:** User is authenticated with `role=admin`.

**Steps:**

1. Page loads pending shelters list.
2. Each shelter shows name, legal_name, city, owner email, registration date.
3. Admin clicks **Aprobar** or **Rechazar**.
4. Frontend sends `POST /api/admin/shelters/approve/<id>/` with `{ action: 'approve' | 'reject' }`.
5. Shelter removed from pending list.

---

### admin-moderation

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | admin |
| **Frontend route** | `/admin/moderacion` |
| **API endpoints** | `GET /api/animals/`, `GET /api/campaigns/`, `GET /api/updates/` |

**Preconditions:** User is authenticated with `role=admin`.

**Steps:**

1. Admin navigates to `/admin/moderacion`.
2. Page loads recently published animals, campaigns, and update posts.
3. Admin can review content and take action (archive, unpublish).

---

### admin-metrics

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | admin |
| **Frontend route** | `/admin/metricas` |
| **API endpoints** | `GET /api/admin/metrics/` |

**Preconditions:** User is authenticated with `role=admin`.

**Steps:**

1. Admin navigates to `/admin/metricas`.
2. Page loads detailed financial and adoption metrics.
3. Displays: total donations, total sponsorships, adoption success rate, shelters by status, animals by status.

---

### admin-payments

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | admin |
| **Frontend route** | `/admin/pagos` |
| **API endpoints** | `GET /api/payments/` (placeholder) |

**Preconditions:** User is authenticated with `role=admin`.

**Steps:**

1. Admin navigates to `/admin/pagos`.
2. Page loads payment audit table.
3. Each row shows payment ID, provider reference, amount, status, donor, date.
4. Placeholder note: "Wompi integration pending — displaying mock data."

---

## Navigation Module

### navigation-header

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | all pages |

**Steps:**

1. Header renders on every page.
2. Contains logo/brand linking to `/`.
3. Navigation links: Animales, Refugios, Campañas, Busco Adoptar.
4. Auth section: Sign In / Sign Up (guest) or user menu with role-specific links (authenticated).

---

### navigation-footer

| Field | Value |
|-------|-------|
| **Priority** | P4 |
| **Roles** | shared |
| **Frontend route** | all pages |

**Steps:**

1. Footer renders on every page.
2. Contains columns: Explore (Animales, Refugios, Campañas), Account (Sign In, Sign Up), Info (FAQ).
3. Copyright and branding.

---

### navigation-between-pages

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | all pages |

**Steps:**

1. User navigates between pages via header links, CTAs, and card links.
2. URL updates correctly in browser address bar.
3. Browser back/forward buttons work as expected.
4. Pages render without full-page reload (client-side navigation).

---

### notification-bell

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter, shelter_admin, admin |
| **Frontend route** | all pages |
| **API endpoints** | `GET /api/notifications/unread-count/`, `GET /api/notifications/logs/`, `PUT /api/notifications/logs/mark-all-read/` |

**Preconditions:** User is authenticated.

**Steps:**

1. Authenticated user sees bell icon in header.
2. Bell displays unread count badge (polled every 30 seconds).
3. User clicks bell icon to open notification dropdown.
4. Dropdown shows up to 10 recent notifications.
5. User clicks **Mark all as read** button.
6. Frontend sends `PUT /api/notifications/logs/mark-all-read/`.
7. Unread count resets to 0, badge disappears.
8. User can click **View all notifications** link to navigate to full notifications page.

---

### locale-switch

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | all pages |

**Preconditions:** None.

**Steps:**

1. User sees ES/EN locale switcher in header.
2. Current locale is highlighted (default: ES).
3. User clicks the alternate locale toggle.
4. Page content re-renders in the target language without full page reload.
5. URL updates to reflect new locale prefix (e.g., `/es/animales` → `/en/animales`).
6. Locale preference persists across navigation.

---

## Public Module

### public-faq

| Field | Value |
|-------|-------|
| **Priority** | P4 |
| **Roles** | shared |
| **Frontend route** | `/faq` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/faq`.
2. Page renders FAQ accordion with questions and answers.
3. User can expand/collapse individual questions.

---

### public-contact

| Field | Value |
|-------|-------|
| **Priority** | P4 |
| **Roles** | shared |
| **Frontend route** | `/contactanos` |
| **API endpoints** | `GET /api/google-captcha/site-key/`, `POST /api/contact/` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/contactanos`.
2. Page renders heading (e.g. Contáctanos), contact form fields, and WhatsApp section.
3. User may submit the form; client requests site key for reCAPTCHA when needed, then `POST /api/contact/` with the message payload.
4. On success, UI shows a confirmation state.

**E2E traceability:** [`frontend/e2e/public/contact.spec.ts`](../frontend/e2e/public/contact.spec.ts).

**Branching conditions:**

| Condition | Behavior |
|-----------|----------|
| API error | Inline or toast error; user remains on page |

---

### public-about

| Field | Value |
|-------|-------|
| **Priority** | P4 |
| **Roles** | shared |
| **Frontend route** | `/about` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/about`.
2. Page renders organization information and mission statement.

---

### public-terms

| Field | Value |
|-------|-------|
| **Priority** | P4 |
| **Roles** | shared |
| **Frontend route** | `/terms` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/terms`.
2. Page renders terms of service content.

---

### public-work-with-us

| Field | Value |
|-------|-------|
| **Priority** | P4 |
| **Roles** | shared |
| **Frontend route** | `/work-with-us` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/work-with-us`.
2. Page renders volunteer and work opportunities information.

---

### public-strategic-allies

| Field | Value |
|-------|-------|
| **Priority** | P4 |
| **Roles** | shared |
| **Frontend route** | `/strategic-allies` |
| **API endpoints** | `GET /api/strategic-allies/` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/strategic-allies`.
2. Page loads partner organizations from `GET /api/strategic-allies/`.
3. Each ally card shows name, logo, and website link.

---

## Blog Module

### blog-browse

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/blog` |
| **API endpoints** | `GET /api/blog/` |

**Preconditions:** None.

**Steps:**

1. User navigates to `/blog`.
2. Page renders featured post card (large) and regular post grid.
3. Search bar allows client-side filtering by title/excerpt.
4. Category filter buttons filter posts by category.
5. Pagination with Previous/Next buttons navigates between pages.
6. User clicks a blog post card to navigate to `/blog/[slug]`.

---

### blog-detail

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/blog/[slug]` |
| **API endpoints** | `GET /api/blog/<slug>/` |

**Preconditions:** Blog post with given slug exists and is published.

**Steps:**

1. User navigates to `/blog/[slug]`.
2. Page renders full article with title, content, author, reading time, date.
3. Reading progress bar tracks scroll position.
4. Back link returns user to blog listing.

---

## Blog Admin Module

### blog-admin-list

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | admin |
| **Frontend route** | `/admin/blog` |
| **API endpoints** | `GET /api/blog/admin/` |

**Preconditions:** User is authenticated with `admin` role.

**Steps:**

1. Admin navigates to `/admin/blog`.
2. Page lists all blog posts (published, draft, scheduled) with status indicators.
3. Links to **Nuevo Post** (create) and **Calendario** (calendar view).
4. Each post row has edit/delete actions.

---

### blog-admin-create

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | admin |
| **Frontend route** | `/admin/blog/crear` |
| **API endpoints** | `POST /api/blog/admin/create/` |

**Preconditions:** User is authenticated with `admin` role.

**Steps:**

1. Admin navigates to `/admin/blog/crear`.
2. Page shows Manual and JSON import tabs.
3. Manual tab: form with title (ES/EN), slug, content, category, cover image, SEO fields.
4. JSON import tab: paste JSON content for bulk creation.
5. Admin fills form and clicks **Publish** / **Save as Draft**.
6. Frontend sends `POST /api/blog/admin/create/` with form data.
7. Blog post created, redirect to admin blog list.

---

### blog-admin-edit

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | admin |
| **Frontend route** | `/admin/blog/[id]/editar` |
| **API endpoints** | `GET /api/blog/admin/<id>/`, `PUT /api/blog/admin/<id>/update/` |

**Preconditions:** User is authenticated with `admin` role. Blog post with given ID exists.

**Steps:**

1. Admin navigates to `/admin/blog/[id]/editar`.
2. Form loads existing post data: title, content, JSON content, SEO fields, cover image.
3. Admin edits fields.
4. Admin clicks **Update** / **Save**.
5. Frontend sends `PUT /api/blog/admin/<id>/update/` with updated data.
6. Blog post updated, success message shown.

---

### blog-admin-calendar

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | admin |
| **Frontend route** | `/admin/blog/calendario` |
| **API endpoints** | `GET /api/blog/admin/calendar/` |

**Preconditions:** User is authenticated with `admin` role.

**Steps:**

1. Admin navigates to `/admin/blog/calendario`.
2. Calendar view renders monthly overview with post indicators.
3. Posts color-coded by status (published, draft, scheduled).
4. Navigation arrows allow moving between months.
5. Clicking a day/post navigates to the edit page.

---

## Volunteer Module

### volunteer-apply

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | shared |
| **Frontend route** | `/work-with-us/apply/[positionId]` |
| **API endpoints** | `GET /api/volunteer-positions/`, `POST /api/volunteer-applications/` |

**Preconditions:** User navigated from `/work-with-us` page. Volunteer position with given ID exists and is active.

**Steps:**

1. User navigates to `/work-with-us` and sees available volunteer positions.
2. User clicks **Apply** on a position card.
3. Browser navigates to `/work-with-us/apply/[positionId]`.
4. Application form renders with fields: name, email, phone, motivation, availability.
5. User fills out the form and completes reCAPTCHA verification.
6. User clicks **Submit**.
7. Frontend sends `POST /api/volunteer-applications/` with form data.
8. On success: confirmation message displayed, email notification sent to admin.
9. On validation error: field-level errors displayed inline.

**Branching:**

- If position is no longer active → show "position unavailable" message.
- If reCAPTCHA fails → submit button remains disabled.

---

### profile-edit

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | adopter |
| **Frontend route** | `/my-profile/edit` |
| **API endpoints** | `GET /api/user/profile/`, `PATCH /api/user/profile/` |

**Preconditions:** User is authenticated.

**Steps:**

1. User navigates to `/my-profile` and clicks **Edit Profile** button.
2. Browser navigates to `/my-profile/edit`.
3. Form loads with current profile data (name, phone, city, bio, avatar).
4. User modifies fields.
5. User clicks **Save**.
6. Frontend sends `PATCH /api/user/profile/` with updated fields.
7. On success: redirected to `/my-profile` with updated data visible.
8. On validation error: field-level errors displayed inline.

**Branching:**

- If user navigates directly to `/my-profile/edit` without auth → redirected to `/sign-in`.

---

### favorites-compare

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | adopter |
| **Frontend route** | `/favorites` |
| **API endpoints** | `GET /api/favorites/`, `GET /api/animals/<id>/` |

**Preconditions:** User is authenticated and has at least 2 favorited animals.

**Steps:**

1. User navigates to `/favorites`.
2. Favorites list renders with animal cards showing enriched data.
3. User selects 2+ animals using comparison checkboxes.
4. User clicks **Compare** button.
5. Comparison modal/panel opens showing side-by-side attributes (species, size, age, energy level, behavioral traits).
6. User reviews differences and closes comparison.

**Branching:**

- If fewer than 2 animals selected → Compare button disabled.
- If no favorites exist → empty state with CTA to browse animals.

---

### blog-admin-delete

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Roles** | admin |
| **Frontend route** | `/admin/blog` |
| **API endpoints** | `DELETE /api/blog/admin/<id>/delete/` |

**Preconditions:** User is authenticated with `admin` role. At least one blog post exists.

**Steps:**

1. Admin navigates to `/admin/blog`.
2. Blog list renders with post rows containing action buttons.
3. Admin clicks **Eliminar** on a post.
4. Confirmation dialog appears: "¿Eliminar [title]? Esta acción no se puede deshacer."
5. Admin clicks **Eliminar** to confirm.
6. Frontend sends `DELETE /api/blog/admin/<id>/delete/`.
7. Post removed from list, page refreshes.

**Branching:**

- If admin clicks **Cancelar** → dialog closes, no deletion.

---

### blog-admin-duplicate

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | admin |
| **Frontend route** | `/admin/blog` |
| **API endpoints** | `POST /api/blog/admin/<id>/duplicate/` |

**Preconditions:** User is authenticated with `admin` role. At least one blog post exists.

**Steps:**

1. Admin navigates to `/admin/blog`.
2. Blog list renders with post rows containing action buttons.
3. Admin clicks **Duplicar** on a post.
4. Confirmation dialog appears: "¿Duplicar [title]?"
5. Admin clicks **Duplicar** to confirm.
6. Frontend sends `POST /api/blog/admin/<id>/duplicate/`.
7. New draft post created, list refreshes showing the duplicate.

**Branching:**

- If admin clicks **Cancelar** → dialog closes, no duplication.

---

### favorite-note-edit

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Roles** | adopter |
| **Frontend route** | `/favorites` |
| **API endpoints** | `PATCH /api/favorites/<id>/` |

**Preconditions:** User is authenticated and has at least one favorited animal.

**Steps:**

1. User navigates to `/favorites`.
2. Favorites list renders with animal cards.
3. User clicks the note icon (sticky note) on a favorite card.
4. Textarea expands inline below the card.
5. User types or edits the note text.
6. After 500ms debounce, frontend sends `PATCH /api/favorites/<id>/` with updated note.
7. Note persists on reload.

**Branching:**

- If note is empty → note icon appears in muted style.
- If note has content → note icon appears in teal with truncated preview.

---

## Cross-Reference

| Artifact | Path | Purpose |
|----------|------|---------|
| Flow Definitions (JSON) | `e2e/flow-definitions.json` | Machine-readable flow registry for the E2E reporter |
| Flow Tag Constants | `e2e/helpers/flow-tags.ts` | Reusable tag arrays for Playwright tests |
| E2E Spec Files | `e2e/<module>/*.spec.ts` | Playwright test implementations per module |
| Flow Coverage Report | `e2e-results/flow-coverage.json` | Auto-generated coverage status per flow |
| Architecture Standard | `docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md` | Sections 3.7.5–3.7.10 define the flow methodology |
| E2E Flow Coverage Standard | `docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md` | Reporter implementation and JSON schema |
| Contract Schemas | `e2e/helpers/contract-schemas.ts` | Backend serializer field definitions for mock validation |
| Contract Validator | `e2e/helpers/contract-validate.ts` | Utility to detect mock/backend schema drift |
| Contract Tests | `e2e/contracts/mock-contract.spec.ts` | CI-runnable contract validation suite |

### Flow ID relationships (deduplication notes)

| Flow IDs | Relationship |
|----------|----------------|
| `adoption-manage` / `shelter-panel-applications` | Misma pantalla de refugio: gestión de solicitudes en `/shelter/applications`. `adoption-manage` enfatiza el dominio “adopción”; `shelter-panel-applications` el panel del refugio. Los E2E deben cubrir la vista y las acciones de estado en esa ruta (ver specs de shelter + adoption). |
| `adoption-track` / `my-applications-list` | Ambos referencian el seguimiento del adoptante en `/my-applications`. `adoption-track` incluye la comprobación de acceso (redirect si no hay sesión); `my-applications-list` cubre el listado autenticado. Un mismo test puede llevar ambos tags `@flow:` cuando aplique. |

### Maintenance Rules

- **Flow IDs must match** across this document, `e2e/flow-definitions.json`, and `e2e/helpers/flow-tags.ts`.
- **Adding a new flow:** Add entry here with full steps/branches, then add to `e2e/flow-definitions.json`, then create E2E tests.
- **Modifying a flow:** Update steps and branches in this document first, then update tests accordingly.
- **Removing a flow:** Remove from this document, `e2e/flow-definitions.json`, and all `@flow:` tags in specs.
- **Bump `Version` and `Last Updated`** on every change.
