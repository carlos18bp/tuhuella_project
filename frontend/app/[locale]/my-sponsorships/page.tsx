'use client';

import { useEffect, useState, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { HeartHandshake, Dog, Cat, PawPrint, MapPin, ChevronRight, TrendingUp, CalendarClock, Heart, ShieldCheck, Award } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useSponsorshipStore } from '@/lib/stores/sponsorshipStore';
import { useAnimalStore } from '@/lib/stores/animalStore';
import { ROUTES } from '@/lib/constants';
import AnimalCard from '@/components/ui/AnimalCard';
import type { SponsorshipStatus } from '@/lib/types';

type StatusFilter = '' | SponsorshipStatus;

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  paused: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  canceled: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function MisApadrinamientosPage() {
  const sponsorships = useSponsorshipStore((s) => s.sponsorships);
  const loading = useSponsorshipStore((s) => s.loading);
  const fetchSponsorships = useSponsorshipStore((s) => s.fetchSponsorships);
  const t = useTranslations('mySponsorships');

  const animals = useAnimalStore((s) => s.animals);
  const fetchAnimals = useAnimalStore((s) => s.fetchAnimals);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  useEffect(() => {
    void fetchSponsorships();
  }, [fetchSponsorships]);

  useEffect(() => {
    if (!loading && sponsorships.length === 0) void fetchAnimals({});
  }, [loading, sponsorships.length, fetchAnimals]);

  const filtered = useMemo(() => {
    if (!statusFilter) return sponsorships;
    return sponsorships.filter((s) => s.status === statusFilter);
  }, [sponsorships, statusFilter]);

  // Summary
  const activeCount = sponsorships.filter((s) => s.status === 'active').length;
  const monthlyTotal = useMemo(() =>
    sponsorships
      .filter((s) => s.status === 'active' && s.frequency === 'monthly')
      .reduce((sum, s) => sum + Number(s.amount), 0),
  [sponsorships]);

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: '', label: t('all') },
    { value: 'active', label: t('active') },
    { value: 'pending', label: t('pending') },
    { value: 'paused', label: t('paused') },
    { value: 'canceled', label: t('canceled') },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/30 ring-1 ring-red-200/50 dark:ring-red-800/40 flex items-center justify-center">
          <HeartHandshake className="h-5 w-5 text-red-500 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t('title')}{sponsorships.length > 0 && ` (${sponsorships.length})`}
          </h1>
          <p className="text-sm text-text-tertiary">{t('subtitle')}</p>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && sponsorships.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border-primary bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/10 dark:to-emerald-900/5 dark:border-emerald-800/30 p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <HeartHandshake className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{activeCount}</p>
              <p className="text-sm text-text-tertiary">{t('activeAnimals')}</p>
            </div>
          </div>
          {monthlyTotal > 0 && (
            <div className="rounded-2xl border border-border-primary bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-900/5 dark:border-amber-800/30 p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <CalendarClock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">${monthlyTotal.toLocaleString()}<span className="text-base font-normal text-text-tertiary">/{t('month')}</span></p>
                <p className="text-sm text-text-tertiary">{t('monthlyContribution')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {!loading && sponsorships.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-11 sm:min-h-0 inline-flex items-center justify-center ${
                statusFilter === opt.value
                  ? 'bg-red-500 text-white'
                  : 'bg-surface-primary border border-border-primary text-text-secondary hover:bg-surface-hover dark:hover:bg-surface-hover'
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
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-xl animate-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 animate-shimmer rounded w-1/3" />
                  <div className="h-3 animate-shimmer rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 && statusFilter ? (
        <div className="mt-10 text-center py-12">
          <HeartHandshake className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <p className="mt-3 text-text-quaternary">{t('noResults')}</p>
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className="mt-3 inline-flex items-center justify-center min-h-11 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium"
          >
            {t('clearFilter')}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10">
          {/* Rich empty state */}
          <div className="rounded-2xl bg-gradient-to-br from-red-50/60 via-surface-primary to-pink-50/30 dark:from-red-900/10 dark:via-surface-primary dark:to-pink-900/10 border border-border-primary p-8 md:p-12">
            <div className="max-w-lg mx-auto text-center">
              <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <HeartHandshake className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-text-primary">{t('empty')}</h2>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">{t('emptyDesc')}</p>

              {/* Benefits */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Heart, label: t('emptyBenefit1'), color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
                  { icon: ShieldCheck, label: t('emptyBenefit2'), color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
                  { icon: Award, label: t('emptyBenefit3'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 bg-surface-primary/80 dark:bg-surface-secondary/50 rounded-xl px-4 py-4 border border-border-tertiary">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-text-secondary text-center">{item.label}</span>
                  </div>
                ))}
              </div>

              <Link
                href={ROUTES.ANIMALS}
                className="mt-6 inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-red-500 text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-red-600 shadow-md hover:shadow-lg transition-all"
              >
                {t('exploreAnimals')} &rarr;
              </Link>
            </div>
          </div>

          {/* Featured animals carousel */}
          {animals.length > 0 && (
            <div className="mt-10 min-w-0 overflow-x-hidden">
              <h2 className="text-lg font-semibold text-text-primary mb-4">{t('featuredAnimals')}</h2>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000, disableOnInteraction: true }}
                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
                className="pb-12"
              >
                {animals.slice(0, 6).map((animal) => (
                  <SwiperSlide key={animal.id}>
                    <AnimalCard animal={animal} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {filtered.map((sp) => {
            const color = statusColors[sp.status] || statusColors.pending;
            const SpeciesIcon = sp.animal_species === 'dog' ? Dog : sp.animal_species === 'cat' ? Cat : PawPrint;
            return (
              <Link
                key={sp.id}
                href={ROUTES.ANIMAL_DETAIL(sp.animal)}
                className="group flex items-center gap-4 rounded-2xl border border-border-primary bg-surface-primary p-5 shadow-sm hover:shadow-md hover:border-border-secondary transition-all"
              >
                {/* Thumbnail */}
                <div className="h-14 w-14 rounded-xl bg-surface-tertiary flex items-center justify-center overflow-hidden shrink-0">
                  {sp.thumbnail_url ? (
                    <img src={sp.thumbnail_url} alt={sp.animal_name} className="h-full w-full object-cover" />
                  ) : (
                    <SpeciesIcon className="h-6 w-6 text-text-quaternary" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-text-primary group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                      {sp.animal_name}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${color}`}>{t(sp.status)}</span>
                      <ChevronRight className="h-4 w-4 text-text-quaternary group-hover:text-text-tertiary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3 w-3 text-text-quaternary" />
                    <p className="text-sm text-text-tertiary truncate">
                      {sp.shelter_name}{sp.shelter_city ? ` · ${sp.shelter_city}` : ''}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-text-primary">${Number(sp.amount).toLocaleString()}</p>
                  <p className="text-xs text-text-quaternary">
                    {sp.frequency === 'monthly' ? t('perMonth') : t('oneTime')}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
