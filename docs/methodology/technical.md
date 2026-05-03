# Tuhuella — Technical Stack & Decisions

> Last updated: 2026-04-19

## Backend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | Django | 6.0.2 | Monolith with DRF |
| API | Django REST Framework | 3.16.x | FBV pattern, JWT auth |
| Auth | `djangorestframework-simplejwt` | — | Access + refresh tokens |
| OAuth | Google OAuth | — | `@react-oauth/google` on frontend |
| Database | SQLite (dev) / MySQL (prod) | — | Single DB, no sharding |
| Images | `django-attachments` | — | `SingleImageField`, `GalleryField` |
| Thumbnails | `easy-thumbnails` | — | On-demand thumbnail generation |
| Cleanup | `django-cleanup` | — | Auto-delete orphaned files |
| Task Queue | Huey + Redis | — | Async tasks (silk reports, etc.) |
| Profiling | `django-silk` | — | Slow query / N+1 detection |
| Backups | `django-dbbackup` | — | Scheduled DB backups |
| Fake Data | Faker + factory-boy | 3.3.3 | 21 management commands + factory classes in tests/factories.py |
| Linting | Ruff | 0.15.x | Fast Python linter |
| Testing | pytest + pytest-django | 9.x / 4.x | 99 test files |

## Frontend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | Next.js | 16.1.x | App Router |
| UI Library | React | 19.2.x | Server + Client components |
| Language | TypeScript | 5.x | Strict mode |
| State | Zustand | 5.x | 10 stores, persist middleware |
| HTTP | Axios | — | Centralized `api` instance with interceptors |
| Styling | TailwindCSS | 4.x | Stone palette + accent variables |
| i18n | next-intl | 4.x | en/es, cookie-based locale |
| Animations | GSAP + ScrollTrigger | — | Scroll-reveal on grids |
| Carousels | Swiper | — | Animal gallery |
| Transitions | Framer Motion | — | Page transitions via `template.tsx` |
| Icons | Heroicons + Lucide | — | Dual icon library |
| Auth | `@react-oauth/google` | — | Google sign-in button |
| Cookies | `js-cookie` + `jwt-decode` | — | Token management |
| Testing | Jest (unit, 289 files) + Playwright (E2E, 17 specs) | 30.x / 1.58.x | Component + flow tests |

## Architecture Decisions

### 1. FBV over CBV (Backend Views)
All views use function-based views with `@api_view` decorators. This keeps views flat, explicit, and easy to test without class inheritance complexity.

### 2. Zustand over Redux
Zustand chosen for minimal boilerplate, TypeScript-first design, and per-store modularity. Each domain (animal, shelter, campaign, etc.) has its own independent store.

### 3. App Router (Next.js)
Using Next.js App Router for file-based routing, server components, and the `template.tsx` pattern for page transitions.

### 4. URL-prefix i18n with `app/[locale]/` segments
Locale routing via `next-intl` with `app/[locale]/` dynamic segments (`/es/`, `/en/`). Default locale is `es`. Provides SEO-friendly per-locale URLs and proper SSR support.

### 5. GSAP dynamic import
GSAP and ScrollTrigger are loaded dynamically via `import()` inside the `useScrollReveal` hook to avoid SSR issues and reduce initial bundle size.

### 6. Placeholder payments
Wompi integration is stubbed with placeholder views that create `Payment` records but don't call external APIs. This allows the full payment flow UI to be built and tested without SDK dependency.

### 7. Single Django app
All models live in `base_feature_app` (kept from template). Content is Tuhuella-specific but the app name is preserved to avoid migration headaches.

### 8. Notification model split
Implementation uses `NotificationPreference` + `NotificationLog` (two models) rather than a single Notification model. This separates configuration from delivery records.

### 9. Dark mode
Theme toggle via ThemeProvider component with cookie persistence. Uses Tailwind `dark:` variant throughout.

### 10. DropdownMenu primitive (`components/ui/DropdownMenu.tsx`)
Reusable dropdown that consolidates outside-click + Escape handling + arrow-key navigation into one place. Uses React 18's `useId()` for SSR-safe IDs (avoids hydration mismatch). Render-prop API: `trigger` receives `{ open, close, getTriggerProps }` — `getTriggerProps()` encapsulates `aria-expanded`, `aria-haspopup`, `aria-controls`, and the trigger `ref`/`id`. An optional `onOpen` callback runs side effects before the panel opens. Exports `DropdownDivider`.

### 11. Header breakpoint convention
Desktop header activates at `lg:` (1024px), not `md:` (768px). Tablets (768–1023px) get the mobile hamburger drawer. This prevents the packed staff-role header from crowding at iPad portrait widths. A mobile notification bell (`<Link>` to `MY_NOTIFICATIONS`) renders beside the hamburger when authenticated (`lg:hidden`, badge from `unreadCount`).

## Environment Variables

### Backend (`backend/.env`)
```
DJANGO_SECRET_KEY=
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_DB_ENGINE=django.db.backends.sqlite3
GOOGLE_OAUTH_CLIENT_ID=
REDIS_URL=redis://localhost:6379/1
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

## Verified Counts (2026-04-19)

| Asset | Count |
|-------|-------|
| Backend model classes | 31 (28 files) |
| Backend serializers | 45 |
| Backend views | 25 |
| Backend URL modules | 24 |
| Backend services | 3 (email, notification, notification_templates) |
| Management commands | 21 |
| Admin classes | 26 (model admins + MiHuellaAdminSite) |
| Frontend pages | 56 |
| Zustand stores | 13 |
| Custom hooks | 5 (useFAQs, useRequireAuth, useScrollReveal, useAuthSync, useMediaQuery) |
| UI components | 66 |
| Animals components | 1 (AnimalHealthSection) |
| Web-manager components | 1 (AdminApplicationsTable) |
| Veterinarian components | 2 (ClinicalEntryForm, ClinicalHistoryTimeline) |
| Layout components | 12 |
| Blog components | 4 |
| Provider components | 3 |
| Total frontend components | 89 |
| Exported types | ~52 |
| Backend test files | 99+ |
| Frontend unit test files | 289+ |
| E2E spec files | 17 |
| E2E flow definitions | 82 |
