import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PREFIXES = ['/backoffice', '/dashboard'];
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password'];
const ACCESS_TOKEN_KEY = 'access_token';

function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.replace(`/${locale}`, '') || '/';
    }
  }
  return pathname;
}

function isProtected(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname);
  return PROTECTED_PREFIXES.some((prefix) => bare.startsWith(prefix));
}

function isAuthRoute(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname);
  return AUTH_ROUTES.some((route) => bare.startsWith(route));
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

  if (isProtected(pathname) && !accessToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute(pathname) && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Delegate to next-intl middleware for locale negotiation
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|media|.*\\..*).*)',
  ],
};
