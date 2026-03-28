'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';

type MetricsData = {
  donations: { total_amount: string; total_count: number; avg_amount: string };
  sponsorships: { total_amount: string; total_count: number; avg_amount: string };
  adoption_rate: { total_published: number; total_adopted: number };
  avg_applications_per_animal: number;
  avg_adoption_time_days: number | null;
  user_retention_30d: number;
};

export default function AdminMetricasPage() {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const t = useTranslations('metrics');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.ADMIN_METRICS);
        setMetrics(res.data);
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (user && user.role !== 'admin' && !user.is_staff) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <p className="text-red-600 font-medium">{t('accessDenied')}</p>
      </div>
    );
  }

  const adoptionRate = metrics?.adoption_rate
    ? metrics.adoption_rate.total_published > 0
      ? Math.round((metrics.adoption_rate.total_adopted / metrics.adoption_rate.total_published) * 100)
      : 0
    : 0;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary">{t('adminTitle')}</h1>
      <p className="mt-1 text-text-tertiary">{t('adminSubtitle')}</p>

      {loading ? (
        <div data-testid="loading-skeleton" className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border-primary p-6 animate-pulse">
              <div className="h-10 bg-surface-tertiary rounded w-1/2" />
              <div className="h-4 bg-surface-tertiary rounded w-2/3 mt-3" />
            </div>
          ))}
        </div>
      ) : metrics ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { value: `$${Number(metrics.donations.total_amount).toLocaleString()}`, label: t('totalDonationsRaised'), detail: `${metrics.donations.total_count} ${t('paidDonations')}`, card: 'border-amber-200 bg-amber-50', value_c: 'text-amber-700', label_c: 'text-amber-600', detail_c: 'text-amber-500' },
            { value: `$${Number(metrics.sponsorships.total_amount).toLocaleString()}`, label: t('totalSponsorships'), detail: `${metrics.sponsorships.total_count} ${t('activeSponsorships')}`, card: 'border-teal-200 bg-teal-50', value_c: 'text-teal-700', label_c: 'text-teal-600', detail_c: 'text-teal-500' },
            { value: `${adoptionRate}%`, label: t('adoptionRate'), detail: `${metrics.adoption_rate.total_adopted} / ${metrics.adoption_rate.total_published}`, card: 'border-emerald-200 bg-emerald-50', value_c: 'text-emerald-700', label_c: 'text-emerald-600', detail_c: 'text-emerald-500' },
            { value: `$${Number(metrics.donations.avg_amount).toLocaleString()}`, label: t('avgDonation'), card: 'border-orange-200 bg-orange-50 dark:bg-surface-tertiary dark:border-orange-500/20', value_c: 'text-orange-700 dark:text-orange-400', label_c: 'text-orange-600 dark:text-orange-400/70' },
            { value: `$${Number(metrics.sponsorships.avg_amount).toLocaleString()}`, label: t('avgSponsorship'), card: 'border-cyan-200 bg-cyan-50 dark:bg-surface-tertiary dark:border-cyan-500/20', value_c: 'text-cyan-700 dark:text-cyan-400', label_c: 'text-cyan-600 dark:text-cyan-400/70' },
            { value: `${metrics.avg_applications_per_animal}`, label: t('avgAppsPerAnimal'), card: 'border-indigo-200 bg-indigo-50 dark:bg-surface-tertiary dark:border-indigo-500/20', value_c: 'text-indigo-700 dark:text-indigo-400', label_c: 'text-indigo-600 dark:text-indigo-400/70' },
            { value: metrics.avg_adoption_time_days != null ? `${metrics.avg_adoption_time_days}d` : '—', label: t('avgAdoptionDays'), card: 'border-purple-200 bg-purple-50 dark:bg-surface-tertiary dark:border-purple-500/20', value_c: 'text-purple-700 dark:text-purple-400', label_c: 'text-purple-600 dark:text-purple-400/70' },
            { value: `${metrics.user_retention_30d}%`, label: t('retention30d'), card: 'border-rose-200 bg-rose-50 dark:bg-surface-tertiary dark:border-rose-500/20', value_c: 'text-rose-700 dark:text-rose-400', label_c: 'text-rose-600 dark:text-rose-400/70' },
            { value: `$${(Number(metrics.donations.total_amount) + Number(metrics.sponsorships.total_amount)).toLocaleString()}`, label: t('totalFinancialImpact'), card: 'border-border-primary bg-surface-primary', value_c: 'text-text-primary', label_c: 'text-text-tertiary' },
          ].map((m) => (
            <div key={m.label} className={`rounded-2xl border p-6 ${m.card}`}>
              <p className={`text-3xl font-bold ${m.value_c}`}>{m.value}</p>
              <p className={`text-sm mt-1 ${m.label_c}`}>{m.label}</p>
              {m.detail && <p className={`text-xs mt-2 ${m.detail_c}`}>{m.detail}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-text-quaternary">{t('loadError')}</p>
      )}
    </div>
  );
}
