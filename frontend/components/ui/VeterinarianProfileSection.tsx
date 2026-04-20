'use client';

import { useEffect, useMemo } from 'react';
import {
  Stethoscope,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { ROUTES } from '@/lib/constants';
import { useFollowUpStore } from '@/lib/stores/followUpStore';
import type { FollowUpStatus } from '@/lib/types';

type StatusCounts = Record<FollowUpStatus, number>;

const EMPTY_COUNTS: StatusCounts = {
  pending: 0,
  in_progress: 0,
  completed: 0,
  overdue: 0,
};

export default function VeterinarianProfileSection() {
  const t = useTranslations('veterinarian');
  const tEdit = useTranslations('editProfile');
  const items = useFollowUpStore((s) => s.items);
  const loading = useFollowUpStore((s) => s.loading);
  const fetchMine = useFollowUpStore((s) => s.fetchMine);

  useEffect(() => {
    if (items.length === 0 && !loading) {
      void fetchMine();
    }
  }, [items.length, loading, fetchMine]);

  const counts = useMemo<StatusCounts>(() => {
    return items.reduce<StatusCounts>((acc, f) => {
      acc[f.status] = (acc[f.status] ?? 0) + 1;
      return acc;
    }, { ...EMPTY_COUNTS });
  }, [items]);

  const stats = [
    {
      icon: Clock,
      value: counts.pending,
      label: t('status.pending'),
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: Stethoscope,
      value: counts.in_progress,
      label: t('status.in_progress'),
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
    },
    {
      icon: CheckCircle2,
      value: counts.completed,
      label: t('status.completed'),
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      icon: AlertTriangle,
      value: counts.overdue,
      label: t('status.overdue'),
      color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border-primary bg-teal-50/50 dark:bg-teal-900/10">
          <div className="h-9 w-9 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">{t('followUpsTitle')}</h2>
            <p className="text-xs text-text-tertiary">{t('followUpsSubtitle')}</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl bg-surface-secondary p-4 text-center">
                  <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{stat.label}</p>
                </div>
              );
            })}
          </div>
          {items.length === 0 && !loading && (
            <p className="mt-4 text-center text-sm text-text-tertiary">{t('noFollowUps')}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border-primary">
          <div className="h-9 w-9 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-teal-600" />
          </div>
          <h2 className="text-base font-bold text-text-primary">{tEdit('quickActions')}</h2>
        </div>
        <div className="p-6">
          <Link
            href={ROUTES.VET_FOLLOW_UPS}
            className="group flex items-center gap-3 rounded-xl border border-border-primary bg-surface-primary px-4 py-3 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm transition-all"
          >
            <div className="h-9 w-9 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 transition-colors">
              <ClipboardList className="h-4 w-4 text-text-tertiary group-hover:text-teal-600 transition-colors" />
            </div>
            <span className="flex-1 text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              {t('followUpsTitle')}
            </span>
            <ChevronRight className="h-4 w-4 text-text-quaternary group-hover:text-text-tertiary group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
