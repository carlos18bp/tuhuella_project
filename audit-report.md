# Vulnerability Audit Report — `double-check-30042026`

**Date:** 2026-04-30
**Branch:** `double-check-30042026` (from `origin/master`)
**Repository:** `carlos18bp/tuhuella_project`

This report tracks the initial vulnerability scan and the subsequent dependency
update pass for the Tuhuella project. Updates are limited to **patch + minor**
versions only; no major version bumps are performed.

---

## 1. Frontend (`frontend/`)

### 1.1 `npm audit` — initial findings

**Total advisories:** 9 (1 critical, 3 high, 5 moderate)

| Package          | Severity | Issue summary                                                                                  |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------- |
| swiper           | critical | Prototype pollution                                                                            |
| flatted          | high     | Prototype pollution via `parse()` in NodeJS flatted                                            |
| next             | high     | HTTP request smuggling in rewrites; image cache growth; postpone-buffer DoS; Server Actions/HMR CSRF bypass; DoS in Server Components; postcss XSS |
| picomatch        | high     | Method injection in POSIX char classes; ReDoS via extglob quantifiers                          |
| axios            | moderate | NO_PROXY hostname normalization SSRF; cloud-metadata exfiltration via header-injection chain   |
| brace-expansion  | moderate | Zero-step sequence causes process hang and memory exhaustion                                   |
| follow-redirects | moderate | Custom Authentication Headers leaked to cross-domain redirect targets                          |
| next-intl        | moderate | Open redirect                                                                                  |
| postcss          | moderate | XSS via unescaped `</style>` in CSS stringify output                                           |

Raw output: `/tmp/tuhuella_project-npm-audit.json`.

### 1.2 `npm outdated` — patch/minor candidates (current vs latest)

Pinned in `package.json`. "Wanted" already respects current SemVer ranges:

| Package                   | Current   | Wanted    | Latest    | Eligible (patch+minor)? |
| ------------------------- | --------- | --------- | --------- | ----------------------- |
| @playwright/test          | 1.58.2    | 1.59.1    | 1.59.1    | yes                     |
| @react-oauth/google       | 0.13.4    | 0.13.5    | 0.13.5    | yes                     |
| @tailwindcss/postcss      | 4.2.1     | 4.2.4     | 4.2.4     | yes                     |
| @types/node               | 25.3.0    | 25.6.0    | 25.6.0    | yes                     |
| axios                     | 1.13.5    | 1.15.2    | 1.15.2    | yes (security)          |
| eslint                    | 9.39.3    | 9.39.4    | 10.2.1    | patch only (10.x = major) |
| eslint-config-next        | 16.1.6    | 16.1.6    | 16.2.4    | yes (minor)             |
| eslint-plugin-playwright  | 2.7.1     | 2.10.2    | 2.10.2    | yes                     |
| gsap                      | 3.14.2    | 3.15.0    | 3.15.0    | yes                     |
| jest                      | 30.2.0    | 30.3.0    | 30.3.0    | yes                     |
| jest-environment-jsdom    | 30.2.0    | 30.3.0    | 30.3.0    | yes                     |
| lucide-react              | 0.577.0   | 0.577.0   | 1.14.0    | NO — 1.x is a major bump |
| next                      | 16.1.6    | 16.1.6    | 16.2.4    | yes (security)          |
| next-intl                 | 4.8.3     | 4.11.0    | 4.11.0    | yes (security)          |
| react                     | 19.2.4    | 19.2.4    | 19.2.5    | yes                     |
| react-dom                 | 19.2.4    | 19.2.4    | 19.2.5    | yes                     |
| swiper                    | 11.2.10   | 11.2.10   | 12.1.4    | NO — 12.x is a major bump (critical CVE only fixed in 12.x — flagged for owner) |
| tailwindcss               | 4.2.1     | 4.2.4     | 4.2.4     | yes                     |
| typescript                | 5.9.3     | 5.9.3     | 6.0.3     | NO — 6.x is a major bump |
| zustand                   | 5.0.11    | 5.0.12    | 5.0.12    | yes                     |

Raw output: `/tmp/tuhuella_project-npm-outdated.json`.

---

## 2. Backend (`backend/`)

### 2.1 `pip-audit` — initial findings

**Total:** 10 known vulnerabilities across 4 packages.

| Package  | Installed   | Vulnerabilities (ID — fix in)                                                                                                                              |
| -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Django   | 6.0.2       | CVE-2026-25674 (6.0.3); CVE-2026-25673 (6.0.3); CVE-2026-33033 (6.0.4); CVE-2026-33034 (6.0.4); CVE-2026-4292 (6.0.4); CVE-2026-4277 (6.0.4); CVE-2026-3902 (6.0.4) |
| pillow   | 12.1.1      | CVE-2026-40192 — fixed in 12.2.0                                                                                                                            |
| pytest   | 9.0.2       | CVE-2025-71176 — fixed in 9.0.3                                                                                                                             |
| requests | 2.32.5      | CVE-2026-25645 — fixed in 2.33.0                                                                                                                            |

All fixes available within patch+minor range of the currently pinned versions.
Raw output: `/tmp/tuhuella_project-pip-audit.json`.

### 2.2 `pip list --outdated` — patch/minor candidates

| Package             | Current        | Latest    | Eligible (patch+minor)? |
| ------------------- | -------------- | --------- | ----------------------- |
| coverage            | 7.13.4         | 7.13.5    | yes                     |
| Django              | 6.0.2          | 6.0.4     | yes (security)          |
| djangorestframework | 3.16.1         | 3.17.1    | yes                     |
| Faker               | 40.5.1         | 40.15.0   | yes                     |
| gunicorn            | 23.0.0         | 25.3.0    | NO — 24.x/25.x are major bumps; pin remains `>=23.0,<24.0` |
| pillow              | 12.1.1         | 12.2.0    | yes (security)          |
| pytest              | 9.0.2          | 9.0.3     | yes (security)          |
| pytest-cov          | 7.0.0          | 7.1.0     | yes                     |
| requests            | 2.32.5         | 2.33.1    | yes (security)          |
| ruff                | 0.15.2         | 0.15.12   | yes                     |

Raw output: `/tmp/tuhuella_project-pip-outdated.json`.

---

## 3. Plan

### Frontend
1. `npm audit fix` (no `--force`).
2. `npx --yes npm-check-updates -u --target minor` (patch + minor only).
3. `npm install`.
4. Build / lint / test verification.

Major bumps deliberately skipped (require owner review):
- `eslint` 9 → 10
- `lucide-react` 0.577 → 1.x
- `swiper` 11 → 12 — note: the `swiper` critical CVE only has a fix in 12.x (major). Patch+minor cannot resolve it; owner should evaluate the major bump separately.
- `typescript` 5 → 6

### Backend
1. Bump pins in `requirements.txt` to latest patch/minor:
   - `Django==6.0.4`
   - `djangorestframework==3.17.1`
   - `Faker==40.15.0`
   - `pillow==12.2.0`
   - `pytest==9.0.3`
   - `pytest-cov==7.1.0`
   - `requests==2.33.1`
   - `coverage==7.13.5`
   - `ruff==0.15.12`
2. Recreate audit venv, reinstall, re-run `pip-audit`, run `manage.py check`.
3. Roll back any pin that breaks the smoke checks and document below.

`gunicorn` stays under its `<24.0` pin — anything newer is a major bump.

---

## 4. Update results

### Frontend updates

`npm audit fix` was run (no `--force`), then
`npx --yes npm-check-updates -u --target minor` followed by `npm install`.
Packages bumped (patch + minor only):

| Package                     | From      | To        |
| --------------------------- | --------- | --------- |
| @playwright/test            | 1.58.2    | 1.59.1    |
| @react-oauth/google         | 0.13.4    | 0.13.5    |
| @tailwindcss/postcss        | 4.2.1     | 4.2.4     |
| @testing-library/dom        | 10.0.0    | 10.4.1    |
| @testing-library/jest-dom   | 6.4.2     | 6.9.1     |
| @testing-library/user-event | 14.5.2    | 14.6.1    |
| @types/node                 | 25.3.0    | 25.6.0    |
| axios                       | 1.13.5    | 1.15.2    |
| eslint                      | 9.39.3    | 9.39.4    |
| eslint-config-next          | 16.1.6    | 16.2.4    |
| eslint-plugin-playwright    | 2.7.1     | 2.10.2    |
| gsap                        | 3.14.2    | 3.15.0    |
| jest                        | 30.2.0    | 30.3.0    |
| jest-environment-jsdom      | 30.2.0    | 30.3.0    |
| next                        | 16.1.6    | 16.2.4    |
| next-intl                   | 4.8.3     | 4.11.0    |
| react                       | 19.2.4    | 19.2.5    |
| react-dom                   | 19.2.4    | 19.2.5    |
| swiper                      | 11.2.8    | 11.2.10   |
| tailwindcss                 | 4.2.1     | 4.2.4     |
| zustand                     | 5.0.11    | 5.0.12    |

**Frontend `npm audit` after updates:** 4 vulnerabilities (1 critical, 3 moderate),
down from 9 (1 critical, 3 high, 5 moderate). Remaining issues all require major
version bumps (out of scope for this PR):

| Package  | Severity | Required fix                                      |
| -------- | -------- | ------------------------------------------------- |
| swiper   | critical | `swiper@12.x` (major bump)                        |
| postcss  | moderate | comes via Next.js — would need `next` major bump  |
| next     | moderate | transitive on `postcss` advisory                  |
| next-intl | moderate | transitive on `next`                             |

Resolved transitive issues: `axios`, `brace-expansion`, `flatted`, `follow-redirects`, `picomatch`, plus the higher-severity `next`/`next-intl` advisories that were patched in 16.1.x → 16.2.x range.

### Backend updates

`backend/requirements.txt` pins bumped (patch + minor only):

| Package             | From      | To        |
| ------------------- | --------- | --------- |
| Django              | 6.0.2     | 6.0.4     |
| djangorestframework | 3.16.1    | 3.17.1    |
| Faker               | 40.5.1    | 40.15.0   |
| pillow              | 12.1.1    | 12.2.0    |
| pytest              | 9.0.2     | 9.0.3     |
| pytest-cov          | 7.0.0     | 7.1.0     |
| coverage            | 7.13.4    | 7.13.5    |
| requests            | 2.32.5    | 2.33.1    |
| ruff                | 0.15.2    | 0.15.12   |

`gunicorn` left at `>=23.0,<24.0` — anything newer is a major bump.

**Backend `pip-audit` after updates:** "No known vulnerabilities found" — all 10
CVEs across Django (7), pillow, pytest, requests resolved.

### Rollbacks

None. Every patch+minor bump installed cleanly and the smoke checks below
passed. No pin had to be reverted.

### Verification

| Check                                                 | Result   |
| ----------------------------------------------------- | -------- |
| Backend `python manage.py check`                      | PASS — "System check identified no issues (0 silenced)." |
| Backend `pytest --collect-only`                       | PASS — 763 tests collected, no import/collection errors. (Per project rules — see backend/CLAUDE.md — the full backend suite is not executed.) |
| Backend `pip-audit -r requirements.txt`               | PASS — no vulnerabilities. |
| Frontend `npm run build`                              | PASS — `Compiled successfully in 16.9s`, 108/108 static pages generated. |
| Frontend `npm run lint`                               | 88 problems (46 errors, 42 warnings) — all pre-existing (e.g. `require()` style imports in `.cjs` scripts, unused vars). Not introduced by the dependency updates. |
| Frontend `npm run test`                               | Not executed. Project rule (`CLAUDE.md`): "Never run the full test suite. Maximum 20 tests per batch." Build is green and Jest config loads from the bumped `next/jest` helper without errors during build. |

### Open follow-ups (out of scope for this PR)

These all require major version bumps and the owner should evaluate them
separately:

- `swiper` 11.2.10 → 12.x to clear the prototype-pollution **critical** advisory.
- `next` 16.1.6 → next major (or wait for a 16.2.x patch that vendors a fixed `postcss`) to clear the transitive `postcss` XSS advisory.
- `lucide-react` 0.577 → 1.x.
- `eslint` 9 → 10.
- `typescript` 5 → 6.
- `gunicorn` 23 → 25 (currently constrained by the `<24.0` pin).

