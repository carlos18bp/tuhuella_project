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
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border-primary p-6 animate-pulse">
              <div className="h-10 bg-surface-tertiary rounded w-1/2" />
              <div className="h-4 bg-surface-tertiary rounded w-2/3 mt-3" />
            </div>
          ))}
        </div>
      ) : metrics ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-3xl font-bold text-amber-700">
              ${Number(metrics.donations.total_amount).toLocaleString()}
            </p>
            <p className="text-sm text-amber-600 mt-1">{t('totalDonationsRaised')}</p>
            <p className="text-xs text-amber-500 mt-2">{metrics.donations.total_count} {t('paidDonations')}</p>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <p className="text-3xl font-bold text-teal-700">
              ${Number(metrics.sponsorships.total_amount).toLocaleString()}
            </p>
            <p className="text-sm text-teal-600 mt-1">{t('totalSponsorships')}</p>
            <p className="text-xs text-teal-500 mt-2">{metrics.sponsorships.total_count} {t('activeSponsorships')}</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-3xl font-bold text-emerald-700">{adoptionRate}%</p>
            <p className="text-sm text-emerald-600 mt-1">{t('adoptionRate')}</p>
            <p className="text-xs text-emerald-500 mt-2">
              {metrics.adoption_rate.total_adopted} / {metrics.adoption_rate.total_published}
            </p>
          </div>

          {/* New enhanced metrics */}
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-3xl font-bold text-orange-700">
              ${Number(metrics.donations.avg_amount).toLocaleString()}
            </p>
            <p className="text-sm text-orange-600 mt-1">{t('avgDonation')}</p>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
            <p className="text-3xl font-bold text-cyan-700">
              ${Number(metrics.sponsorships.avg_amount).toLocaleString()}
            </p>
            <p className="text-sm text-cyan-600 mt-1">{t('avgSponsorship')}</p>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
            <p className="text-3xl font-bold text-indigo-700">{metrics.avg_applications_per_animal}</p>
            <p className="text-sm text-indigo-600 mt-1">{t('avgAppsPerAnimal')}</p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6">
            <p className="text-3xl font-bold text-purple-700">
              {metrics.avg_adoption_time_days != null ? `${metrics.avg_adoption_time_days}d` : '—'}
            </p>
            <p className="text-sm text-purple-600 mt-1">{t('avgAdoptionDays')}</p>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <p className="text-3xl font-bold text-rose-700">{metrics.user_retention_30d}%</p>
            <p className="text-sm text-rose-600 mt-1">{t('retention30d')}</p>
          </div>

          <div className="rounded-2xl border border-border-primary bg-surface-primary p-6">
            <p className="text-3xl font-bold text-text-primary">
              ${(Number(metrics.donations.total_amount) + Number(metrics.sponsorships.total_amount)).toLocaleString()}
            </p>
            <p className="text-sm text-text-tertiary mt-1">{t('totalFinancialImpact')}</p>
          </div>
        </div>
      ) : (
        <p className="mt-8 text-text-quaternary">{t('loadError')}</p>
      )}
    </div>
  );
}
