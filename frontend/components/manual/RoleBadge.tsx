'use client';

import { useTranslations } from 'next-intl';

import type { ManualAudience } from '@/lib/manual/types';

const STYLES: Record<ManualAudience, string> = {
  public: 'bg-stone-100 text-stone-700 dark:bg-stone-900/40 dark:text-stone-300',
  adopter: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
  shelter_admin: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  veterinarian: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  web_manager: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  admin: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  cross: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
};

type Props = {
  audience: ManualAudience;
  className?: string;
};

export default function RoleBadge({ audience, className = '' }: Props) {
  const t = useTranslations('manual');
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[audience]} ${className}`.trim()}
    >
      {t(`audience.${audience}`)}
    </span>
  );
}
