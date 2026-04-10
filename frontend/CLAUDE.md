# Frontend Rules — Tuhuella

> **Important**: unlike most other Next.js projects in this ecosystem, **Tuhuella runs Next.js as a long-running Node.js process** on port 3001 (`tuhuella-frontend.service`). It is **NOT statically exported**. `next.config.ts` defines URL rewrites that proxy `/api/*` and `/media/*` back to the Django backend.

## Stack And Scope
- **Next.js 16.1.6 + React 19.2 + TypeScript** with the **App Router** and `[locale]` dynamic segments.
- **Node 20** (NOT 22 — pinned by the systemd unit).
- **Runtime server**, NOT static export. `next.config.ts` does NOT use `output: 'export'`.
- **State management**: **Zustand 5.0** (NOT Redux, NOT Context). Stores in `lib/stores/` (`animalStore`, `authStore`, `blogStore`, `shelterStore`, etc.).
- **HTTP**: **Axios 1.13** wrapped in `lib/services/http.ts` with JWT interceptors and auto-refresh on 401.
- **i18n**: **next-intl 4.8** with `app/[locale]/` segments and `messages/{es,en}.json`. Default locale is `es`.
- **Styling**: Tailwind CSS 4.
- **UI components**: custom-built (NOT shadcn, NOT Material UI). Icons via `lucide-react` + `@heroicons/react`. Animations via `framer-motion 12.38`.
- **Tests**: Jest + Testing Library + jsdom for unit; Playwright for E2E (Desktop Chrome, Mobile Chrome, Tablet).

## Project Conventions
- **TypeScript-first**. Strict mode. Function components with hooks.
- Use **`'use client'`** at the top of files that need interactivity, browser APIs, or auth state. Server Components (the default) can fetch data per-request because there is a real Node runtime.
- **Routing via `app/[locale]/`**: every URL is locale-prefixed (`/es/...`, `/en/...`). Do not remove the `[locale]` segment.
- **Auth hydration**: client components must call `useAuthStore.hydrate()` before reading auth state.
- **HTTP via `lib/services/http.ts`**: never call `fetch()` or raw `axios` directly. The wrapped instance handles JWT injection and refresh on 401.
- **Filename conventions**:
  - Stores → camelCase (`animalStore.ts`, `authStore.ts`).
  - Components → PascalCase (`AnimalCard.tsx`, `ShelterHero.tsx`).
  - Pages → `page.tsx`. Layouts → `layout.tsx`.
  - Hooks → camelCase with `use` prefix in `lib/hooks/` (`useScrollReveal.ts`).
  - Utilities → camelCase (`http.ts`, `utils.ts`, `constants.ts`).
- **Bilingual strings**: every visible text goes through `next-intl`'s `useTranslations()` hook. Bilingual model fields (`title_en`/`title_es`) are read in components based on the active locale.
- **Same-origin API calls**: `next.config.ts` rewrites `/api/*` and `/media/*` to Django, so the frontend uses same-origin URLs (no CORS in production).

## UX And Routing
- App Router with `[locale]` segments. Do **not** introduce Pages Router or remove the locale segment.
- For Playwright and async UI work, prefer **role-based locators** and **explicit element waits**.
- Do **not** use `networkidle` for Next.js dev flows.

## Commands
- Dev server: `cd frontend && npm run dev` (Next.js, default :3000; Node 20 required)
- Unit tests (Jest): `cd frontend && npm test -- path/to/file.test.tsx`
- E2E (Playwright): `cd frontend && npm run e2e:module -- path/to/spec.ts` (or `e2e:modules`, `e2e:coverage`)
- Build: `cd frontend && npm run build` (standalone build, NOT static export)
- Production start: `cd frontend && npm start` (runs on port 3001 in prod via systemd)

## Testing Rules
- Never run the full frontend unit or E2E suite.
- Maximum 20 tests per batch and 3 commands per cycle.
- Assert user-visible behavior, not implementation details.
- Use stable locators in E2E (`getByRole` > `getByTestId`).
- Jest coverage thresholds: 50% globally. Run with `NODE_OPTIONS=--no-deprecation`.

## Production reminder
- The Next.js process runs as **its own systemd service** (`tuhuella-frontend.service`). After a deploy, restart it: `sudo systemctl restart tuhuella-frontend`.
- The frontend depends on **Node 20** specifically — coordinate any upgrade with the systemd unit.
