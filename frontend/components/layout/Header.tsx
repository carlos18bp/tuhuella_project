'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES } from '@/lib/constants';
import LocaleSwitcher from './LocaleSwitcher';

const publicNav = [
  { label: 'Animales', href: ROUTES.ANIMALS },
  { label: 'Refugios', href: ROUTES.SHELTERS },
  { label: 'Campañas', href: ROUTES.CAMPAIGNS },
  { label: 'Busco Adoptar', href: ROUTES.BUSCO_ADOPTAR },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-lg">
      <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between gap-4">
        <Link href={ROUTES.HOME} className="text-xl font-bold tracking-tight text-stone-800">
          Mi&nbsp;Huella
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-stone-600">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LocaleSwitcher />
          {isAuthenticated ? (
            <>
              {user?.role === 'shelter_admin' && (
                <Link
                  href={ROUTES.SHELTER_DASHBOARD}
                  className="text-sm px-3 py-2 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors"
                >
                  Panel Refugio
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  href={ROUTES.ADMIN_DASHBOARD}
                  className="text-sm px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href={ROUTES.FAVORITES}
                className="text-sm px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Favoritos
              </Link>
              <Link
                href={ROUTES.MY_PROFILE}
                className="text-sm px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Mi Perfil
              </Link>
              <button
                onClick={signOut}
                type="button"
                className="text-sm border border-stone-300 rounded-full px-4 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.SIGN_IN}
                className="text-sm border border-stone-300 rounded-full px-4 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href={ROUTES.SIGN_UP}
                className="text-sm bg-teal-600 text-white rounded-full px-4 py-2 hover:bg-teal-700 transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-stone-100"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50/95 backdrop-blur-lg">
          <nav className="flex flex-col px-6 py-4 gap-1 text-sm font-medium text-stone-600">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-3 rounded-lg hover:bg-stone-100"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-stone-200" />
            {isAuthenticated ? (
              <>
                <Link href={ROUTES.FAVORITES} className="px-3 py-3 rounded-lg hover:bg-stone-100" onClick={() => setMobileOpen(false)}>
                  Favoritos
                </Link>
                <Link href={ROUTES.MY_PROFILE} className="px-3 py-3 rounded-lg hover:bg-stone-100" onClick={() => setMobileOpen(false)}>
                  Mi Perfil
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  type="button"
                  className="text-left px-3 py-3 rounded-lg hover:bg-stone-100 text-red-600"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href={ROUTES.SIGN_IN} className="px-3 py-3 rounded-lg hover:bg-stone-100" onClick={() => setMobileOpen(false)}>
                  Iniciar sesión
                </Link>
                <Link
                  href={ROUTES.SIGN_UP}
                  className="px-3 py-3 rounded-lg bg-teal-600 text-white text-center hover:bg-teal-700"
                  onClick={() => setMobileOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
