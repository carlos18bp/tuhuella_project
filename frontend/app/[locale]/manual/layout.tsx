'use client';

import { useTranslations } from 'next-intl';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { canAccessStaffArea } from '@/lib/auth/permissions';
import AdminAccessDenied from '@/components/ui/AdminAccessDenied';

export default function ManualLayout({ children }: { children: React.ReactNode }) {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const t = useTranslations('manual');

  if (user && !canAccessStaffArea(user)) {
    return <AdminAccessDenied>{t('accessDenied')}</AdminAccessDenied>;
  }

  return <div className="mx-auto max-w-[1400px] px-6 py-10">{children}</div>;
}
