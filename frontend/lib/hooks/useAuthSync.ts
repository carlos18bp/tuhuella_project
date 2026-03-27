'use client'

import { useEffect } from 'react'

import { useAuthStore } from '@/lib/stores/authStore'

/**
 * Syncs auth state from cookies after hydration.
 * Call once at the app root to avoid SSR hydration mismatches.
 */
export function useAuthSync() {
  const isAuthReady = useAuthStore((s) => s.isAuthReady)

  useEffect(() => {
    if (!isAuthReady) {
      useAuthStore.getState().syncFromCookies()
    }
  }, [isAuthReady])

  return isAuthReady
}
