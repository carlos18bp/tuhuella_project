/**
 * @jest-environment node
 *
 * proxy() builds real Fetch API `Request`/`Headers`/`URL` objects via NextRequest,
 * which jsdom (this project's default jest environment) does not implement. Node's
 * built-in Fetch API globals cover everything NextRequest/NextResponse need here, so
 * this file opts into the `node` environment via the per-file docblock instead of
 * touching the shared jest.config.cjs.
 */
import { describe, it, expect } from '@jest/globals';
import { NextRequest } from 'next/server';

import { proxy } from '../proxy';

// next-intl/middleware and next-intl/routing ship ESM-only builds (no `require`
// condition in their package.json `exports`), which this project's SWC transform
// does not cover for third-party packages, so importing proxy.ts unmocked fails to
// parse. Both are irrelevant to the auth-guard branches under test — proxy() returns
// before ever calling intlMiddleware() on every path exercised below — so they are
// stubbed at the same boundary the repo already uses for i18n/routing (see
// app/[locale]/__tests__/layout.test.tsx).
jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

jest.mock('@/i18n/routing', () => ({
  routing: { locales: ['es', 'en'], defaultLocale: 'es' },
}));

// Mirrors proxy.ts's PROTECTED_PREFIXES as an independent, hand-maintained oracle
// (the const itself is not exported). If a route is added/renamed/mistyped in
// proxy.ts without updating this list, the corresponding case here starts failing
// instead of silently exposing the page to anonymous users.
const PROTECTED_PREFIXES = [
  '/admin',
  '/backoffice',
  '/checkout',
  '/dashboard',
  '/favorites',
  '/my-applications',
  '/my-donations',
  '/my-intent',
  '/my-profile',
  '/my-sponsorships',
  '/shelter',
];

function buildRequest(pathname: string, cookieHeader?: string): NextRequest {
  const headers = new Headers();
  if (cookieHeader) headers.set('cookie', cookieHeader);
  return new NextRequest(`https://example.com${pathname}`, { headers });
}

describe('proxy() — auth guard redirects', () => {
  describe('protected route, no access_token cookie', () => {
    it.each(PROTECTED_PREFIXES)(
      'redirects %s to /sign-in with next set to the original pathname',
      (prefix) => {
        const response = proxy(buildRequest(prefix));

        // 307 + Location pinned to a concrete pathname and next value, not mere
        // "is a redirect" — catches a mistyped/omitted PROTECTED_PREFIXES entry
        // (page would 200 through to intlMiddleware instead of redirecting) and a
        // regression that drops the `next` param (breaks post-login redirect-back).
        expect(response.status).toBe(307);
        const location = new URL(response.headers.get('location') ?? '');
        expect(location.pathname).toBe('/sign-in');
        expect(location.searchParams.get('next')).toBe(prefix);
      }
    );
  });

  describe('auth route, access_token cookie present', () => {
    it('redirects /sign-in to the home page instead of rendering the form', () => {
      const response = proxy(buildRequest('/sign-in', 'access_token=valid-session-token'));

      // Catches a regression where an already-authenticated user can still reach
      // /sign-in (e.g. isAuthRoute or the cookie check silently broken) instead of
      // being bounced to `/`.
      expect(response.status).toBe(307);
      const location = new URL(response.headers.get('location') ?? '');
      expect(location.pathname).toBe('/');
    });
  });
});
