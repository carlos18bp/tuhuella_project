<!-- fleet-base:begin v=1 -->
# CLAUDE.md — Tuhuella (`tuhuella_project_staging`)

Esta seccion es la **base comun del fleet** y se sincroniza desde
`vps-ops-toolkit/workflows/.claude/base/CLAUDE.md.tmpl`. No editar manualmente:
los cambios se pierden en el proximo sync. Para customizar este proyecto, usar
la seccion `project-specific` mas abajo.

## Convencion de lenguaje

- Documentacion, comentarios y mensajes de commit en **ingles**.
- Codigo, identificadores y nombres de variable en **ingles**.
- Mensajes de error visibles al usuario final en el idioma del proyecto.

<!-- session-start-protocol:begin -->
## Session Start Protocol

Al inicio de **cada sesión y antes de editar archivos**, debes invocar la skill `git-sync` para este repo. Razón: el operador trabaja desde múltiples máquinas y procesos automatizados (cron, CI) pueden haber commiteado cambios que tu copia local no tiene; editar sobre una versión desactualizada genera conflictos o trabajo duplicado.

**Flujo:**
1. Un hook `SessionStart` (definido en `.claude/settings.json`) ejecuta `git fetch + git status` read-only y te inyecta el estado de este repo como contexto.
2. Si el reporte indica `behind > 0` o `dirty > 0`, **invoca la skill `git-sync`** antes de hacer cualquier cambio. `git-sync` hace rebase contra el parent branch y, si hay conflictos, te guía interactivamente por la resolución.
3. Si el reporte indica `behind=0 ahead=0 dirty=0`, el repo ya está sincronizado y puedes proceder.

**Importante:** Nunca uses `git pull --force`, `git reset --hard` ni stash automático para "resolver" el sync — usa siempre la skill `git-sync`, que es segura y reproducible.
<!-- session-start-protocol:end -->

<!-- git-branch-protocol:begin -->
## Reglas de trabajo con Git: ramas y commits

**Nunca hagas commits directamente sobre `main` o `master`.** Estas ramas están protegidas y los pushes serán rechazados por GitHub.

**El default es REUTILIZAR una rama abierta, no crear una nueva.** La convención del fleet es **máximo 1 PR feature activo por proyecto**: todo el trabajo en curso — aunque sean features o arreglos distintos entre sí — se acumula como **commits sucesivos sobre esa misma rama** hasta que mergee. **Lo que identifica cada pieza de trabajo es el COMMIT, no una rama nueva.** Crear una rama por cada cambio fragmenta el trabajo en PRs paralelos y hace imposible un code review unificado. **Sólo se crea una rama cuando estás en `main`/`master` y NO hay ninguna rama abierta.** Antes de cualquier `git commit`, seguí este protocolo:

### 1. Verificar la rama actual

Antes de cualquier operación de escritura (add, commit, etc.), ejecuta:

```bash
git rev-parse --abbrev-ref HEAD
```

- **Si ya estás en una rama feature** (cualquier rama que no sea `main`/`master`): **quedate ahí y commiteá**, sin importar si el cambio actual es de un feature distinto al que originó la rama. NO crees una rama nueva — pasá directo a la sección 8 (commit).
- **Si estás en `main`/`master`**: seguí la sección 2 antes de commitear.

### 2. Si estás en `main` o `master`: primero buscá una rama abierta para reutilizar

**Antes de siquiera pensar en crear una rama**, buscá si ya hay una rama feature con PR abierto (o trabajo en curso) para este proyecto y reutilizala. Preferí los PRs abiertos — son literalmente "la rama abierta para revisar los cambios":

```bash
git fetch --quiet --prune
# Fuente preferida: PRs abiertos (rama + URL)
gh pr list --state open --json headRefName,url -q '.[] | "\(.headRefName)	\(.url)"' 2>/dev/null
# Fallback si gh no está disponible: ramas remotas que no son main/master/release-*/HEAD
git branch -r | grep -vE 'origin/(HEAD|main|master|release-)' | sed 's@^[[:space:]]*origin/@@' | sort -u
```

- **Si hay UNA rama abierta** (PR abierto o trabajo en curso): `git checkout <rama-existente>`, `git pull --rebase` si está atrás del remote, y **commiteá ahí — aunque tu cambio sea de otra naturaleza que el trabajo previo de esa rama**. No crees rama nueva. **No pidas permiso para el checkout**, sólo comunicalo: "Hay rama feature activa `<X>`, voy a commitear ahí."
- **Si hay VARIAS ramas abiertas**: preguntá al usuario en cuál commitear (no asumas).
- **Si NO hay ninguna rama abierta** (todas mergeadas/cerradas, o son ramas históricas abandonadas): recién ahí creá una rama nueva según el formato de la sección 3.

### 3. Formato obligatorio del nombre de rama

`<prefijo>/<DDMMYYYY>-<descripcion-corta>`

- **`<prefijo>`** según el tipo de cambio:
  - `feat` — nueva funcionalidad
  - `fix` — corrección de bug
  - `docs` — cambios en documentación
  - `refactor` — refactorización sin cambio funcional
  - `test` — añadir o modificar tests
  - `chore` — mantenimiento (dependencias, configs)
  - `style` — formato/estilo, sin cambio de lógica
  - `perf` — mejoras de rendimiento
  - `ci` — cambios en workflows o pipelines
  - `hotfix` — corrección urgente en producción

- **`<DDMMYYYY>`** debe ser la fecha actual del sistema obtenida con `date +%d%m%Y`. Nunca la asumas ni la inventes.

- **`<descripcion-corta>`** en kebab-case, máximo 5 palabras, en inglés o español según el idioma del proyecto.

### 4. Ejemplos de nombres válidos

- `feat/15052026-login-google-oauth`
- `fix/15052026-typo-readme`
- `refactor/15052026-extract-user-service`
- `docs/15052026-update-deploy-guide`
- `chore/15052026-bump-django-version`

### 5. Comandos exactos a ejecutar

```bash
# 1. Obtener la fecha del día (no asumirla)
TODAY=$(date +%d%m%Y)

# 2. Crear y moverse a la nueva rama
git checkout -b <prefijo>/${TODAY}-<descripcion-corta>

# 3. Recién entonces hacer add y commit
git add <archivos>
git commit -m "<mensaje siguiendo conventional commits>"
```

### 6. Inferencia del prefijo

Determina el prefijo a partir del contenido de los cambios:
- Archivos nuevos que añaden features → `feat`
- Cambios que arreglan comportamiento roto → `fix`
- Solo cambios en `*.md`, comentarios o JSDoc → `docs`
- Cambios en `package.json`, `requirements.txt`, configs → `chore`
- Cambios en `.github/workflows/*` → `ci`
- Archivos `*test*` / `*spec*` modificados o añadidos → `test`
- Reorganización sin alterar comportamiento → `refactor`

Si hay ambigüedad, pregunta al usuario una sola vez antes de crear la rama.

### 7. Excepciones

- Operaciones de solo lectura (`git status`, `git log`, `git diff`, `git pull`, `git fetch`) están permitidas en `main`/`master`.
- Si el usuario explícitamente pide quedarse en `main` para revisar algo sin commitear, respeta esa intención.
- Si ya estás en una rama feature válida (no `main`/`master`), **nunca** crees una rama paralela para un cambio "distinto" — seguí commiteando en la rama actual. Cada cambio es un commit más, no una rama más. **Convención por defecto: 1 rama / 1 PR feature activo por proyecto a la vez.**

### 8. Mensajes de commit

Sigue Conventional Commits, con el mismo prefijo de la rama cuando aplique:

```
feat: add Google OAuth login flow
fix: correct typo in deployment README
refactor: extract user validation into service
```

### 9. Reporte final: URL del PR

Después de cada `git push` que cree una rama nueva en el remote, **siempre** termina tu respuesta dando al usuario la URL "Create a pull request" que GitHub imprime en el output del push.

- Formato: `https://github.com/<owner>/<repo>/pull/new/<branch>`.
- Inclúyela como una de las **últimas líneas** del cierre de turno, etiquetada como `PR URL: <url>`.
- Si la rama ya existía y tiene un PR abierto, reporta la URL del PR existente (usa `gh pr view --json url -q .url` si la necesitas).
- Si por excepción se commiteó directo a `main`/`master` (sólo posible en proyectos sin esta regla), declara explícitamente: "PR URL: n/a (push directo a `main`)".
- Si hubo cambios en varios proyectos en el mismo turno, entrega una **lista** con un `PR URL:` por proyecto.
<!-- git-branch-protocol:end -->

<!-- e2e-user-flows-protocol:begin -->
## E2E User Flows Check

Cuando termines de implementar un cambio que afecte un **flujo de usuario en el frontend** — por ejemplo:
- Crear o editar un formulario (agregar/quitar campos)
- Nueva ruta, página o vista accesible al usuario
- Cambios en flujos de autenticación, checkout, onboarding, búsqueda, perfil
- Modificaciones a `docs/USER_FLOW_MAP.md` o `frontend/e2e/flow-definitions.json`

…debes invocar la skill `e2e-user-flows-check` como **paso final** antes de reportar la implementación como completa. Esa skill audita la cobertura E2E del flujo modificado y reporta brechas/riesgos.

**Por qué:** los flujos de usuario en frontend cambian las assumptions de los tests E2E. Sin auditoría, un campo eliminado deja tests "verdes" pero inválidos, y un form nuevo queda sin cobertura.

**No aplica para:** correcciones aisladas que no cambian el flujo (typos, refactors internos, estilos puros, dependency bumps), ni cambios solo en backend que no alteren UX.

**Recordatorio automático:** un hook `Stop` revisa al cierre del turno si hay cambios uncommitted bajo `frontend/src/`, `frontend/app/`, etc., y te lo inyecta como contexto. El hook es un recordatorio, no bloqueante — la regla aplica igual aunque el hook no dispare.
<!-- e2e-user-flows-protocol:end -->

## Ecosistemas IA paralelos

Este proyecto tiene tres ecosistemas activos en paralelo: Claude Code (este
archivo + `.claude/`), Codex (`AGENTS.md` + `.agents/skills/` + `.codex/config.toml`)
y Windsurf (`.windsurf/rules/` + `.windsurf/workflows/`). Los tres comparten el
mismo cuerpo de instrucciones general; el frontmatter y la estructura cambian
por ecosistema. La fuente de verdad es `vps-ops-toolkit/workflows/`.

<!-- fleet-base:end -->

<!-- project-specific:begin -->
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
<!-- project-specific:end -->
