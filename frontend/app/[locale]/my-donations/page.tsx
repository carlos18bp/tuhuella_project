'use client';

import { useEffect, useState, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { HandCoins, TrendingUp, MapPin, Megaphone, ChevronRight, Heart, Syringe, Stethoscope } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useDonationStore } from '@/lib/stores/donationStore';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { ROUTES } from '@/lib/constants';
import { CampaignCard } from '@/components/ui';
import type { DonationStatus } from '@/lib/types';

type StatusFilter = '' | DonationStatus;

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  failed: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  refunded: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
};

export default function MisDonacionesPage() {
  const donations = useDonationStore((s) => s.donations);
  const loading = useDonationStore((s) => s.loading);
  const fetchDonations = useDonationStore((s) => s.fetchDonations);
  const t = useTranslations('myDonations');

  const campaigns = useCampaignStore((s) => s.campaigns);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  useEffect(() => {
    void fetchDonations();
  }, [fetchDonations]);

  useEffect(() => {
    if (!loading && donations.length === 0) void fetchCampaigns(undefined, 'active');
  }, [loading, donations.length, fetchCampaigns]);

  const filtered = useMemo(() => {
    if (!statusFilter) return donations;
    return donations.filter((d) => d.status === statusFilter);
  }, [donations, statusFilter]);

  // Summary
  const totalDonated = useMemo(() =>
    donations.filter((d) => d.status === 'paid').reduce((sum, d) => sum + Number(d.amount), 0),
  [donations]);
  const paidCount = donations.filter((d) => d.status === 'paid').length;

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: '', label: t('all') },
    { value: 'paid', label: t('paid') },
    { value: 'pending', label: t('pending') },
    { value: 'failed', label: t('failed') },
    { value: 'refunded', label: t('refunded') },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <HandCoins className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {t('title')}{donations.length > 0 && ` (${donations.length})`}
          </h1>
          <p className="text-sm text-text-tertiary">{t('subtitle')}</p>
        </div>
      </div>

      {/* Summary card */}
      {!loading && donations.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border-primary bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-900/5 dark:border-amber-800/30 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">${totalDonated.toLocaleString()}</p>
            <p className="text-sm text-text-tertiary">{t('totalDonated', { count: paidCount })}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {!loading && donations.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-amber-600 text-white'
                  : 'bg-surface-primary border border-border-primary text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border-primary bg-surface-primary p-6">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-6 animate-shimmer rounded w-24" />
                  <div className="h-3 animate-shimmer rounded w-1/3" />
                </div>
                <div className="h-6 w-16 animate-shimmer rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 && statusFilter ? (
        <div className="mt-10 text-center py-12">
          <HandCoins className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <p className="mt-3 text-text-quaternary">{t('noResults')}</p>
          <button type="button" onClick={() => setStatusFilter('')} className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium">
            {t('clearFilter')}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10">
          {/* Rich empty state */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-surface-primary to-orange-50/30 dark:from-amber-900/10 dark:via-surface-primary dark:to-orange-900/10 border border-border-primary p-8 md:p-12">
            <div className="max-w-lg mx-auto text-center">
              <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
                <HandCoins className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-text-primary">{t('empty')}</h2>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">{t('emptyDesc')}</p>

              {/* Impact items */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Heart, label: t('emptyImpact1'), color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
                  { icon: Syringe, label: t('emptyImpact2'), color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
                  { icon: Stethoscope, label: t('emptyImpact3'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 bg-surface-primary/80 dark:bg-surface-secondary/50 rounded-xl px-4 py-4 border border-border-tertiary">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-text-secondary text-center">{item.label}</span>
                  </div>
                ))}
              </div>

              <Link href={ROUTES.CAMPAIGNS} className="mt-6 inline-block bg-amber-600 text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-amber-700 shadow-md hover:shadow-lg transition-all">
                {t('exploreCampaigns')} &rarr;
              </Link>
            </div>
          </div>

          {/* Active campaigns carousel */}
          {campaigns.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-text-primary mb-4">{t('activeCampaigns')}</h2>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: true }}
                breakpoints={{ 768: { slidesPerView: 2 } }}
                className="pb-12"
              >
                {campaigns.slice(0, 4).map((campaign) => (
                  <SwiperSlide key={campaign.id}>
                    <CampaignCard campaign={campaign} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {filtered.map((donation) => {
            const color = statusColors[donation.status] || statusColors.pending;
            return (
              <div key={donation.id} className="rounded-2xl border border-border-primary bg-surface-primary p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold text-text-primary">${Number(donation.amount).toLocaleString()}</p>
                    {donation.campaign_title && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Megaphone className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400 truncate">{donation.campaign_title}</p>
                      </div>
                    )}
                    {donation.shelter_name && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-text-quaternary shrink-0" />
                        <p className="text-sm text-text-tertiary truncate">
                          {donation.shelter_name}{donation.shelter_city ? ` · ${donation.shelter_city}` : ''}
                        </p>
                      </div>
                    )}
                    {donation.message && (
                      <p className="text-xs text-text-quaternary mt-2 italic line-clamp-2">&ldquo;{donation.message}&rdquo;</p>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${color}`}>
                    {t(donation.status)}
                  </span>
                </div>
                <p className="text-xs text-text-quaternary mt-3 border-t border-border-tertiary pt-2">
                  {donation.paid_at
                    ? t('paidOn', { date: new Date(donation.paid_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) })
                    : t('createdOn', { date: new Date(donation.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) })
                  }
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
