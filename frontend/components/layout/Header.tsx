'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PawPrint, Heart, User, LogOut, LayoutDashboard, Shield, Bell, CheckCheck, ChevronDown } from 'lucide-react';

import { useAuthStore } from '@/lib/stores/authStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { ROUTES } from '@/lib/constants';
import LocaleSwitcher from './LocaleSwitcher';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  const tNotif = useTranslations('notifications');
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Poll unread count every 30s when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchUnreadCount();
    const interval = setInterval(() => void fetchUnreadCount(), 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const handleBellClick = useCallback(() => {
    if (!bellOpen) {
      void fetchNotifications('in_app');
    }
    setBellOpen((prev) => !prev);
  }, [bellOpen, fetchNotifications]);

  // Close bell on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);

  // Close about dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const publicNav = [
    { label: t('animals'), href: ROUTES.ANIMALS },
    { label: t('shelters'), href: ROUTES.SHELTERS },
    { label: t('campaigns'), href: ROUTES.CAMPAIGNS },
    { label: t('lookingToAdopt'), href: ROUTES.LOOKING_TO_ADOPT },
    { label: t('blog'), href: ROUTES.BLOG },
  ];

  const aboutSubLinks = [
    { label: t('aboutUs'), href: ROUTES.ABOUT },
    { label: t('workWithUs'), href: ROUTES.WORK_WITH_US },
    { label: t('strategicAllies'), href: ROUTES.STRATEGIC_ALLIES },
  ];

  // Strip locale prefix (e.g. /es/animals → /animals) for route matching
  const pathnameWithoutLocale = (pathname ?? '/').replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  const isActive = (href: string) =>
    href === '/'
      ? pathnameWithoutLocale === '/'
      : pathnameWithoutLocale === href || pathnameWithoutLocale.startsWith(href + '/');
  const isAboutActive = aboutSubLinks.some((link) => isActive(link.href));

  return (
    <header className="sticky top-0 z-50 border-b border-border-primary/60 bg-surface-secondary/80 backdrop-blur-xl shadow-[0_1px_3px_0_rgb(0,0,0,0.03)] dark:bg-surface-secondary/75 dark:border-border-primary dark:shadow-[0_1px_0_0_rgba(255,255,255,0.03)]">
      <div className="mx-auto max-w-[1400px] px-6 py-3.5 flex items-center justify-between gap-4">
        <Link href={ROUTES.HOME} className="group flex items-center gap-2 text-xl font-bold tracking-tight text-text-primary hover:text-teal-700 transition-colors">
          <PawPrint className="h-6 w-6 text-teal-600 group-hover:rotate-[-8deg] transition-transform duration-300" />
          Tu&nbsp;Huella
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 text-sm font-medium text-text-secondary">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-surface-hover hover:text-text-primary ${
                isActive(item.href)
                  ? 'text-teal-700 dark:text-teal-300 font-semibold'
                  : ''
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-400 dark:to-teal-300" />
              )}
            </Link>
          ))}
          {/* Nosotros dropdown */}
          <div ref={aboutRef} className="relative">
            <button
              type="button"
              onClick={() => setAboutOpen((prev) => !prev)}
              className={`relative flex items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-surface-hover hover:text-text-primary ${
                isAboutActive
                  ? 'text-teal-700 dark:text-teal-300 font-semibold'
                  : ''
              }`}
            >
              {t('about')}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
              {isAboutActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-400 dark:to-teal-300" />
              )}
            </button>
            {aboutOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 rounded-xl border border-border-primary bg-surface-elevated dark:bg-surface-elevated/95 dark:backdrop-blur-xl dark:border-border-secondary shadow-lg z-50 overflow-hidden py-1">
                {aboutSubLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-2.5 text-sm transition-colors hover:bg-surface-hover ${
                      isActive(link.href) ? 'text-teal-700 font-semibold' : 'text-text-secondary'
                    }`}
                    onClick={() => setAboutOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-border-secondary to-transparent mx-1" />
          {!isAuthReady ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-full bg-surface-hover animate-pulse" />
              <div className="h-8 w-24 rounded-full bg-surface-hover animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <>
              {user?.role === 'shelter_admin' && (
                <Link
                  href={ROUTES.SHELTER_DASHBOARD}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('shelterPanel')}
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  href={ROUTES.ADMIN_DASHBOARD}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  {t('admin')}
                </Link>
              )}
              <Link
                href={ROUTES.FAVORITES}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
              >
                <Heart className="h-4 w-4" />
                {t('favorites')}
              </Link>
              {/* Notification bell */}
              <div ref={bellRef} className="relative">
                <button
                  type="button"
                  onClick={handleBellClick}
                  className="relative flex items-center justify-center text-sm px-2 py-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
                  aria-label={tNotif('bellLabel')}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div data-testid="notification-dropdown" className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border-primary bg-surface-elevated dark:bg-surface-elevated/95 dark:backdrop-blur-xl dark:border-border-secondary shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border-tertiary">
                      <span className="text-sm font-semibold text-text-primary">{tNotif('bellTitle')}</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => void markAllAsRead()}
                          className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                        >
                          <CheckCheck className="h-3 w-3" />
                          {tNotif('markAllRead')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-text-quaternary text-center">{tNotif('noNotifications')}</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-border-tertiary text-sm ${
                              n.is_read ? 'text-text-quaternary' : 'text-text-secondary bg-teal-50/30'
                            }`}
                          >
                            <p className="font-medium">{tNotif(`events.${n.event_key}`)}</p>
                            <p className="text-xs text-text-quaternary mt-0.5">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      href={ROUTES.MY_NOTIFICATIONS}
                      className="block px-4 py-2.5 text-xs text-center text-teal-600 hover:bg-surface-hover border-t border-border-tertiary"
                      onClick={() => setBellOpen(false)}
                    >
                      {tNotif('viewAllNotifications')}
                    </Link>
                  </div>
                )}
              </div>
              <Link
                href={ROUTES.MY_PROFILE}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 ring-2 ring-surface-primary shadow-sm text-teal-700 flex items-center justify-center text-xs font-bold">
                  {user?.first_name?.[0]?.toUpperCase() ?? <User className="h-3.5 w-3.5" />}
                </div>
                {t('myProfile')}
              </Link>
              <button
                onClick={signOut}
                type="button"
                className="flex items-center gap-1.5 text-sm border border-border-secondary rounded-full px-4 py-2 text-text-secondary hover:bg-surface-hover btn-base"
              >
                <LogOut className="h-4 w-4" />
                {tCommon('signOut')}
              </button>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.SIGN_IN}
                className="text-sm border border-border-secondary rounded-full px-4 py-2 text-text-secondary hover:bg-surface-hover btn-base"
              >
                {tCommon('signIn')}
              </Link>
              <Link
                href={ROUTES.SIGN_UP}
                className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-full px-5 py-2 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium"
              >
                {tCommon('signUp')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-surface-hover"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="md:hidden border-t border-border-primary bg-surface-secondary/95 backdrop-blur-xl animate-scale-in shadow-lg dark:bg-surface-secondary/90 dark:border-border-secondary">
          <nav className="flex flex-col px-6 py-4 gap-1 text-sm font-medium text-text-secondary">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'text-teal-700 dark:text-teal-300 font-semibold'
                    : 'hover:bg-surface-hover'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <p className="px-3 pt-3 pb-1 text-xs font-semibold text-text-quaternary uppercase tracking-wider">{t('about')}</p>
            {aboutSubLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-3 pl-6 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'text-teal-700 dark:text-teal-300 font-semibold'
                    : 'hover:bg-surface-hover'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 py-2">
              <LocaleSwitcher onSelect={() => setMobileOpen(false)} />
              <ThemeToggle />
            </div>
            <hr className="my-2 border-border-primary" />
            {!isAuthReady ? (
              <div className="flex flex-col gap-2 px-3">
                <div className="h-10 rounded-lg bg-surface-hover animate-pulse" />
                <div className="h-10 rounded-lg bg-surface-hover animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              <>
                <Link href={ROUTES.FAVORITES} className="px-3 py-3 rounded-lg hover:bg-surface-hover" onClick={() => setMobileOpen(false)}>
                  {t('favorites')}
                </Link>
                <Link href={ROUTES.MY_PROFILE} className="px-3 py-3 rounded-lg hover:bg-surface-hover" onClick={() => setMobileOpen(false)}>
                  {t('myProfile')}
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  type="button"
                  className="text-left px-3 py-3 rounded-lg hover:bg-surface-hover text-red-600"
                >
                  {tCommon('signOut')}
                </button>
              </>
            ) : (
              <>
                <Link href={ROUTES.SIGN_IN} className="px-3 py-3 rounded-lg hover:bg-surface-hover" onClick={() => setMobileOpen(false)}>
                  {tCommon('signIn')}
                </Link>
                <Link
                  href={ROUTES.SIGN_UP}
                  className="px-3 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white text-center hover:from-teal-500 hover:to-teal-600"
                  onClick={() => setMobileOpen(false)}
                >
                  {tCommon('signUp')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
