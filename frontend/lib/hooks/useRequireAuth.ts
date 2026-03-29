'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

import { useAuthStore } from '@/lib/stores/authStore';

export const useRequireAuth = () => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const syncFromCookies = useAuthStore((s) => s.syncFromCookies);

  useEffect(() => {
    syncFromCookies();
  }, [syncFromCookies]);

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isAuthReady, isAuthenticated, router]);

  return { isAuthenticated };
};
