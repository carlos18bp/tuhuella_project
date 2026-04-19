'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';

import { useFollowUpStore } from '@/lib/stores/followUpStore';
import { ROUTES } from '@/lib/constants';
import type { FollowUpStatus } from '@/lib/types';

const statusBadge: Record<FollowUpStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  in_progress: 'bg-sky-50 text-sky-700 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  overdue: 'bg-red-50 text-red-700 ring-red-200',
};

export default function VeterinarianFollowUpsPage() {
  const t = useTranslations('veterinarian');
  const items = useFollowUpStore((s) => s.items);
  const loading = useFollowUpStore((s) => s.loading);
  const fetchMine = useFollowUpStore((s) => s.fetchMine);

  useEffect(() => {
    void fetchMine();
  }, [fetchMine]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">{t('followUpsTitle')}</h1>
        <p className="text-sm text-text-tertiary mt-1">{t('followUpsSubtitle')}</p>
      </header>

      {loading ? (
        <div role="status" aria-label="loading" className="py-10 text-center text-text-tertiary">
          {t('loading')}
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-text-tertiary">{t('noFollowUps')}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((f) => (
            <li key={f.id}>
              <Link
                href={ROUTES.VET_FOLLOW_UP_DETAIL(f.id)}
                className="flex items-center justify-between rounded-2xl border border-border-primary bg-surface-primary p-4 hover:bg-surface-hover transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">{f.animal_name}</p>
                  <p className="text-xs text-text-tertiary">
                    {t('scheduledFor', { date: new Date(f.scheduled_date).toLocaleDateString() })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex text-xs px-2 py-1 rounded-full ring-1 font-medium ${statusBadge[f.status]}`}>
                    {t(`status.${f.status}`)}
                  </span>
                  <ChevronRight className="h-5 w-5 text-text-quaternary shrink-0" aria-hidden />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
