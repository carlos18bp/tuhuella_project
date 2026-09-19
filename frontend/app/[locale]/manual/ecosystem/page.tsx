'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import EcosystemExplorer from '@/components/manual/ecosystem/EcosystemExplorer';
import { useAuthStore } from '@/lib/stores/authStore';

export default function EcosystemPage() {
  const t = useTranslations('manual.ecosystem');
  const ready = useAuthStore((state) => state.isAuthReady && state.isAuthenticated);
  const loading = <p role="status" className="py-12 text-text-secondary">{t('loading')}</p>;
  if (!ready) return loading;
  return <Suspense fallback={loading}><EcosystemExplorer /></Suspense>;
}
