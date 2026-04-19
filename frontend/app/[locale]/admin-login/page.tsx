'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { setTokens } from '@/lib/services/tokens';
import { useAuthStore } from '@/lib/stores/authStore';

function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations('common');

  useEffect(() => {
    const access = params.get('access');
    const refresh = params.get('refresh');
    const redirect = params.get('redirect') || '/';

    if (!access || !refresh) {
      router.replace('/sign-in');
      return;
    }

    setTokens({ access, refresh });
    useAuthStore.getState().syncFromCookies();
    router.replace(redirect);
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-text-secondary">
      {t('signingIn')}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminLoginInner />
    </Suspense>
  );
}
