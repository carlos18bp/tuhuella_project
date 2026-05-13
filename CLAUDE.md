# Tuhuella — Claude Compatibility Guide

## Source Of Truth
- The canonical repo guidance is maintained in the Codex-native surfaces: `AGENTS.md`, `backend/AGENTS.md`, `frontend/AGENTS.md`, `.agents/skills/*`, `.codex/config.toml`.
- This `CLAUDE.md` file is a compatibility mirror for mixed-tool teams and should stay aligned with the Codex guidance.
- Long-lived project context lives in `docs/methodology/` and `tasks/`.

## Project Overview
- **What it is**: Tuhuella — an animal adoption + sponsorship + donation platform connecting users with partner shelters. Features: animal browsing/filtering, adoption applications with status tracking, monthly sponsorships, one-time donations to shelters or campaigns, fundraising campaigns, bilingual blog, volunteer positions, per-user dashboards (`my-applications`, `my-donations`, favorites, notifications), and shelter admin panels.
- **Stack**: Django 6.0.2 + DRF (backend) / **Next.js 16.1.6 + React 19.2 + TypeScript** (frontend, App Router with `[locale]` segments) / MySQL 8 (`tuhuella_db`) / Redis / Huey / SMTP email.
- **Single Django app**: `base_feature_app` (27 models). **Django module name is `base_feature_project`** — a generic boilerplate name **shared with `fernando_aragon_project`**. Settings module: `base_feature_project.settings_prod`.
- **Production path**: `/home/ryzepeck/webapps/tuhuella_project`.
- **Domain**: `tuhuella.projectapp.co`.
- **Services** (THREE systemd units): `tuhuella_project.service` (backend Gunicorn), `tuhuella-huey.service` (queue worker), **`tuhuella-frontend.service` (Next.js Node 20 process on port 3001)**. All three must be running.
- **Frontend runs as its own service** — it is **NOT** statically exported. nginx → Next.js (3001) → Next.js rewrites `/api/*` and `/media/*` back to Django (`8000`).

## Architecture Invariants
- **Backend views are 100% function-based** with `@api_view`. Do not introduce CBV/`APIView`/`ViewSets`.
- **Single business app `base_feature_app`** with 27 models. Do not introduce parallel apps unless absolutely necessary.
- **Service layer is real**: `base_feature_app/services/` holds `EmailService`, `NotificationService`, `NotificationTemplates` (locale-aware). Always go through these services for email and notifications.
- **Event-driven notifications**: app events create `NotificationLog` rows; a Huey task (`send_email_notification(log_id)`) renders the localized template, sends the email, and updates the log to SENT/FAILED.
- **Bilingual content via paired fields** (`title_en`/`title_es`, etc.). Frontend reads the field that matches the active locale. Do not introduce `django.i18n` `.po` files.
- **`python-dotenv`** is the env-loading standard (NOT `python-decouple`). Preserve this.
- **JWT-only auth** on `/api/` (15-min access token, longer refresh). Admin uses session + CSRF.
- **Custom `User`** model with email auth, profile fields, roles.
- **Custom AdminSite** in `base_feature_app/admin.py`.
- **Archivable mixin** for soft-delete (`archived_at`).
- **Frontend uses Next.js 16 + React 19 + App Router** with **`app/[locale]/`** dynamic locale segments.
- **NOT static export**: `next.config.ts` does NOT use `output: 'export'`. Instead, it defines URL rewrites that proxy `/api/*` and `/media/*` to the Django backend, and the Next.js process runs as a Node 20 service.
- **State management is Zustand** (NOT Redux, NOT Context). Stores in `lib/stores/` (`animalStore`, `authStore`, `blogStore`, `shelterStore`, etc.).
- **HTTP via Axios** wrapped in `lib/services/http.ts` with JWT interceptors and auto-refresh on 401.
- **i18n via `next-intl`** with `messages/{es,en}.json` and `app/[locale]/` routing. Default locale is `es`.
- **No shadcn/ui, no Material UI** — components are custom-built. Icons via `lucide-react` + `@heroicons/react`. Animations via `framer-motion`.
- **Conditional Silk**: gated by `ENABLE_SILK=True`. Off by default.

## Working Rules
- Prefer existing project patterns over generic framework advice.
- Do not rename `base_feature_project` or `base_feature_app` to `tuhuella_*` — they are shared boilerplate names.
- Do not switch from `python-dotenv` to `python-decouple` or vice versa.
- Do not change old migrations; add new migrations when schema changes are required.
- Keep security basics intact: validated serializer inputs, ORM-first queries, escaped rendering, secure cookies, no secrets in code.
- Do not edit files inside `frontend/.next/` — they are build artifacts.
- New email types should be added as methods on `EmailService` + a `NotificationTemplate`, not inlined into views.
- Remember the **three-service** deployment: backend Gunicorn, Huey worker, **and** the Next.js frontend service.

## Commands
- Backend tests: `cd backend && source venv/bin/activate && pytest base_feature_app/tests/path/to/test_file.py -v`
- Backend dev server: `cd backend && source venv/bin/activate && python manage.py runserver`
- Frontend dev server: `cd frontend && npm run dev` (Next.js, default :3000; Node 20 required)
- Frontend unit tests (Jest): `cd frontend && npm test -- path/to/file.test.tsx`
- Frontend E2E (Playwright): `cd frontend && npm run e2e:module -- path/to/spec.ts`
- Frontend build: `cd frontend && npm run build` (standalone build, NOT static export)

## Testing Constraints
- Never run the full test suite.
- Maximum 20 tests per batch and 3 test commands per cycle.
- Run only the smallest backend, frontend unit, or E2E slice needed for the changed behavior.
- Frontend Jest coverage thresholds: 50% globally (branches/functions/lines/statements).

## Memory Bank
- Core files: `docs/methodology/{product_requirement_docs,architecture,technical,error-documentation,lessons-learned}.md`, `tasks/{tasks_plan,active_context}.md`.
- Read `architecture.md` for the JWT auth flow and the notification pipeline.
- Update memory files when the user asks, or when you have verified a meaningful change to runtime surfaces, architecture, or recurring workflow guidance.
- Do not churn memory files after every routine code edit.
<!-- session-start-protocol:begin -->
## Session Start Protocol

Al inicio de **cada sesión y antes de editar archivos**, debes invocar la skill `git-sync` para este repo. Razón: el operador trabaja desde múltiples máquinas y procesos automatizados (cron, CI) pueden haber commiteado cambios que tu copia local no tiene; editar sobre una versión desactualizada genera conflictos o trabajo duplicado.

**Flujo:**
1. Un hook `SessionStart` (definido en `.claude/settings.json`) ejecuta `git fetch + git status` read-only y te inyecta el estado de este repo como contexto.
2. Si el reporte indica `behind > 0` o `dirty > 0`, **invoca la skill `git-sync`** antes de hacer cualquier cambio. `git-sync` hace rebase contra el parent branch y, si hay conflictos, te guía interactivamente por la resolución.
3. Si el reporte indica `behind=0 ahead=0 dirty=0`, el repo ya está sincronizado y puedes proceder.

**Importante:** Nunca uses `git pull --force`, `git reset --hard` ni stash automático para "resolver" el sync — usa siempre la skill `git-sync`, que es segura y reproducible.
<!-- session-start-protocol:end -->
