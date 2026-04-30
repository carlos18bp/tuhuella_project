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

_(populated below after the update commits.)_

### Frontend updates

### Backend updates

### Rollbacks

### Verification (build/tests)
