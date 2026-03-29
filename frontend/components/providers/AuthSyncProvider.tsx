'use client'

import { useAuthSync } from '@/lib/hooks/useAuthSync'

interface AuthSyncProviderProps {
  children: React.ReactNode
}

export function AuthSyncProvider({ children }: AuthSyncProviderProps) {
  useAuthSync()
  return <>{children}</>
}
