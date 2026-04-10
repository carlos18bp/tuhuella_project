# Frontend Rules — Next.js 16 + React 19 + App Router (Tuhuella)

> **Important**: unlike most other Next.js projects in this ecosystem, **Tuhuella runs Next.js as a long-running Node.js process** via the `tuhuella-frontend.service` systemd unit on port **3001**. It is **NOT statically exported**. `next.config.ts` defines URL rewrites that proxy `/api/*` and `/media/*` back to the Django backend.

## Stack

- **Next.js 16.1.6** with the **App Router** (NOT Pages Router)
- **React 19.2.4**, **TypeScript 5**
- **Node 20** (NOT 22 — pinned by the systemd unit)
- **Tailwind CSS 4.2.1**
- **Zustand 5.0.11** for state management
- **Axios 1.13.5** wrapped by `lib/services/http.ts` (with JWT interceptors and auto-refresh)
- **next-intl 4.8.3** for ES/EN bilingual support (via `app/[locale]/` segments)
- **lucide-react 0.577** + **@heroicons/react 2.2** for icons (NOT shadcn, NOT Material UI)
- **framer-motion 12.38** for animations
- **Tests**: **Jest** + Testing Library + jsdom for unit; **Playwright** for E2E (Desktop Chrome, Mobile Chrome, Tablet profiles)

This is a **Next.js + React 19 runtime project** — **NOT static export**, **NOT Vue**, **NOT Vite SPA**.

## Runtime model: not static export

- `next.config.ts` does **not** use `output: 'export'`. The Next.js process runs as a long-running Node service.
- The systemd unit `tuhuella-frontend.service` runs `npm start` (Next.js production server) on port **3001**.
- nginx proxies the public domain to `127.0.0.1:3001`, and `next.config.ts` defines URL rewrites that send `/api/*` and `/media/*` from the Next.js process back to the Django backend at `127.0.0.1:8000`.
- This means **Server Components can fetch data per-request** (you have a real Node runtime, not just SSG output). Use this where it makes sense, but be mindful of latency added by the extra hop.
- **Do not switch to `output: 'export'`** — it would break the rewrites and the proxy chain.

## Code Style and Structure

- **TypeScript-first**. Strict mode is on.
- Use **function components** with hooks. No class components.
- Use **`'use client'`** at the top of files that need interactivity, browser APIs, or auth state.
- Pure **Server Components** (the default in App Router) are still useful for layouts and any page that can render entirely from server data.

## Naming Conventions

- **Component files**: PascalCase (`AnimalCard.tsx`, `ShelterHero.tsx`).
- **Page files**: lowercase `page.tsx` per App Router convention.
- **Layout files**: lowercase `layout.tsx`.
- **Store files**: camelCase under `lib/stores/` (`animalStore.ts`, `authStore.ts`, `blogStore.ts`, `shelterStore.ts`, etc.).
- **Hooks**: camelCase with `use` prefix under `lib/hooks/` (`useScrollReveal.ts`).
- **Utilities and services**: camelCase (`http.ts`, `utils.ts`, `constants.ts`).
- **Locale files**: ISO codes (`es.json`, `en.json`) under `messages/`.

## Routing — App Router with `[locale]` segments

- Routes live under `app/[locale]/` — every URL is locale-prefixed (`/es/...`, `/en/...`).
- Locale routing is configured in `i18n/routing.ts`. Default locale is **`es`**.
- Top-level routes under `app/[locale]/`:
  - `/` — home / animal browsing
  - `/shelters`, `/shelters/[shelterId]` — shelter list and detail
  - `/animals` — animal search/filter
  - `/adopt`, `/looking-to-adopt` — adoption flow
  - `/blog`, `/blog/[slug]` — bilingual blog
  - `/campaigns` — fundraising campaign list
  - `/checkout/*` — donation/sponsorship checkout flow
  - `/sign-in`, `/forgot-password` — auth
  - `/my-applications`, `/my-donations`, `/my-intent` — user dashboards
  - `/admin/*` — shelter admin panel
- **Do not introduce file-based routing tricks beyond what App Router provides.**
- **Do not remove the `[locale]` segment** — it is the source of truth for the active locale.

## State Management — Zustand

- All stores live in `lib/stores/`.
- Stores use the standard Zustand `create((set, get) => ({...}))` pattern.
- The `authStore` reads JWT tokens (15-minute access, longer refresh) and exposes a `hydrate()` action that should be called in client-side layouts before reading auth state.
- Each domain has its own store: `animalStore`, `blogStore`, `shelterStore`, etc.

## HTTP — Axios via `lib/services/http.ts`

- All HTTP goes through the single Axios instance in `frontend/lib/services/http.ts`.
- **Token injection**: an interceptor reads `accessToken` and sets `Authorization: Bearer <token>` on every request.
- **Token refresh**: on 401, the interceptor attempts a refresh using the `refreshToken`. If the refresh fails, the user is redirected to sign-in.
- **Never call `fetch()` or raw `axios` directly** in components or stores. Always use the wrapped instance.
- **Note**: because `next.config.ts` rewrites `/api/*` to the Django backend, the frontend can use **same-origin URLs** for API calls (no CORS needed in production).

## i18n — `next-intl` with `app/[locale]/`

- `next-intl 4.8.3` provides ES/EN bilingual support.
- Locale messages live in `frontend/messages/` (`es.json`, `en.json`).
- The active locale comes from the `[locale]` URL segment.
- Default locale is **`es`** (Spanish).
- **Never hardcode user-facing strings** — every visible text goes through `useTranslations()`.
- Bilingual model fields (`title_en`/`title_es`) are read in components based on the active locale.

## UI — custom components, no shadcn/MUI

- Components are custom-built in `app/components/` and per-domain folders.
- **Icons**: `lucide-react 0.577` and `@heroicons/react 2.2`.
- **Animations**: `framer-motion 12.38`.
- Custom hook: `useScrollReveal` for scroll-triggered effects.

## Tailwind CSS 4

### Class Ordering
Layout → position → spacing → sizing → typography → visual → interactive.

### Responsive
Mobile-first. Breakpoint order: `sm:` → `md:` → `lg:` → `xl:` → `2xl:`.

### Avoid
- Never use `style=""` when a Tailwind class exists.
- Avoid arbitrary values; define design tokens in `tailwind.config.ts`.
- No `!important` (`!` prefix) unless overriding third-party styles.

## Testing — Jest + Playwright

### Jest (unit)
- Test files in `frontend/__tests__/` and per-component `__tests__/` folders with `.test.tsx` or `.test.ts` extension.
- Run: `cd frontend && npm test -- path/to/file.test.tsx`
- Use **React Testing Library**: `render`, `screen`, `userEvent`. Prefer `screen.getByRole`, `screen.getByLabelText`, `screen.getByTestId`.
- Coverage thresholds: **50% globally** (branches/functions/lines/statements). Run with `NODE_OPTIONS=--no-deprecation`.
- The `jsdom` environment is configured.
- Setup files: `jest.setup.ts`.

### Playwright (E2E)
- Specs in `frontend/e2e/`.
- Run via per-module helpers: `npm run e2e:module`, `npm run e2e:modules`, `npm run e2e:coverage`.
- Profiles: Desktop Chrome, Mobile Chrome, Tablet.
- **Selector hierarchy**: `getByRole` > `getByTestId` > `locator('[data-testid=...]')`.
- **No `waitForTimeout()`** — use `toBeVisible()`, `waitForResponse()`, `waitForURL()`.

## Build & Deployment

- `npm run build` creates a Next.js standalone build (NOT a static export).
- `npm start` runs the production server on port 3001 — this is what `tuhuella-frontend.service` does.
- The systemd unit must be restarted after a deploy: `sudo systemctl restart tuhuella-frontend`.
- The frontend depends on **Node 20** specifically (pinned in the systemd unit).

## What NOT to do

- Do **not** switch to `output: 'export'` (static export) — it would break the rewrites and the nginx → Next.js → Django proxy chain.
- Do **not** introduce Pages Router or runtime SSR layers beyond what App Router provides.
- Do **not** introduce shadcn/ui or Material UI — components are custom-built.
- Do **not** introduce Redux or Context API for state — Zustand is the convention.
- Do **not** call `fetch()` or raw `axios` outside of `lib/services/http.ts`.
- Do **not** hardcode user-facing strings — use `next-intl`.
- Do **not** access auth state without calling `useAuthStore.hydrate()` first in client components.
- Do **not** remove the `[locale]` segment from the App Router.
- Do **not** upgrade Node beyond 20 without coordinating with the systemd unit.
