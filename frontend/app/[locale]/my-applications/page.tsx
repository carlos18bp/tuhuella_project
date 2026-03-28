'use client';

import { useEffect, useState, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ClipboardList, Dog, Cat, PawPrint, ChevronRight, Search as SearchIcon, CircleDot, FileCheck, MessageSquare } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useAdoptionStore } from '@/lib/stores/adoptionStore';
import { useAnimalStore } from '@/lib/stores/animalStore';
import { ROUTES } from '@/lib/constants';
import ApplicationTimeline from '@/components/ui/ApplicationTimeline';
import AnimalCard from '@/components/ui/AnimalCard';
import type { AdoptionApplicationStatus } from '@/lib/types';

type StatusFilter = '' | AdoptionApplicationStatus;

export default function MisSolicitudesPage() {
  const applications = useAdoptionStore((s) => s.applications);
  const loading = useAdoptionStore((s) => s.loading);
  const fetchApplications = useAdoptionStore((s) => s.fetchApplications);
  const t = useTranslations('myApplications');

  const animals = useAnimalStore((s) => s.animals);
  const fetchAnimals = useAnimalStore((s) => s.fetchAnimals);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (!loading && applications.length === 0) void fetchAnimals({});
  }, [loading, applications.length, fetchAnimals]);

  const filtered = useMemo(() => {
    if (!statusFilter) return applications;
    return applications.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter]);

  // Summary counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { total: applications.length };
    for (const app of applications) c[app.status] = (c[app.status] || 0) + 1;
    return c;
  }, [applications]);

  const statusOptions: { value: StatusFilter; label: string; color: string }[] = [
    { value: '', label: t('all'), color: '' },
    { value: 'submitted', label: t('submitted'), color: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300' },
    { value: 'reviewing', label: t('reviewing'), color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { value: 'interview', label: t('interview'), color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    { value: 'approved', label: t('approved'), color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { value: 'rejected', label: t('rejected'), color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  ];

  const getStatusBadge = (status: string) => {
    const opt = statusOptions.find((o) => o.value === status);
    return opt ? { label: opt.label, color: opt.color } : { label: status, color: 'bg-stone-100 text-stone-700' };
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {t('title')}{counts.total > 0 && ` (${counts.total})`}
          </h1>
          <p className="text-sm text-text-tertiary">{t('subtitle')}</p>
        </div>
      </div>

      {/* Summary stats */}
      {!loading && counts.total > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['submitted', 'reviewing', 'interview', 'approved', 'rejected'] as const).map((s) => {
            const badge = getStatusBadge(s);
            return (
              <div key={s} className={`rounded-xl px-4 py-3 text-center ${badge.color}`}>
                <p className="text-2xl font-bold">{counts[s] || 0}</p>
                <p className="text-xs font-medium mt-0.5">{badge.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      {!loading && counts.total > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-surface-primary border border-border-primary text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {opt.label}
              {opt.value && counts[opt.value] ? ` (${counts[opt.value]})` : ''}
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
                  <div className="h-8 animate-shimmer rounded w-full mt-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 && statusFilter ? (
        <div className="mt-10 text-center py-12">
          <PawPrint className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <p className="mt-3 text-text-quaternary">{t('noResults')}</p>
          <button type="button" onClick={() => setStatusFilter('')} className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium">
            {t('clearFilter')}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10">
          {/* Rich empty state */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-50 via-surface-primary to-emerald-50/30 dark:from-teal-900/10 dark:via-surface-primary dark:to-emerald-900/10 border border-border-primary p-8 md:p-12">
            <div className="max-w-lg mx-auto text-center">
              <div className="h-16 w-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto">
                <ClipboardList className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-text-primary">{t('empty')}</h2>
              <p className="mt-2 text-sm text-text-tertiary leading-relaxed">{t('emptyDesc')}</p>

              {/* Steps */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 text-left">
                {[
                  { icon: SearchIcon, label: t('emptyStep1') },
                  { icon: FileCheck, label: t('emptyStep2') },
                  { icon: MessageSquare, label: t('emptyStep3') },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface-primary/80 dark:bg-surface-secondary/50 rounded-xl px-4 py-3 flex-1 border border-border-tertiary">
                    <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                      <step.icon className="h-4 w-4 text-teal-600" />
                    </div>
                    <span className="text-xs font-medium text-text-secondary">{step.label}</span>
                  </div>
                ))}
              </div>

              <Link href={ROUTES.ANIMALS} className="mt-6 inline-block bg-teal-600 text-white rounded-full px-8 py-3 text-sm font-medium hover:bg-teal-700 shadow-md hover:shadow-lg transition-all">
                {t('exploreAnimals')} &rarr;
              </Link>
            </div>
          </div>

          {/* Featured animals carousel */}
          {animals.length > 0 && (
            <div className="mt-10">
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
        <div className="mt-8 space-y-4">
          {filtered.map((app) => {
            const badge = getStatusBadge(app.status);
            const SpeciesIcon = app.animal_species === 'dog' ? Dog : app.animal_species === 'cat' ? Cat : PawPrint;
            return (
              <Link
                key={app.id}
                href={ROUTES.ANIMAL_DETAIL(app.animal)}
                className="group block rounded-2xl border border-border-primary bg-surface-primary p-5 shadow-sm hover:shadow-md hover:border-border-secondary transition-all"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="h-14 w-14 rounded-xl bg-surface-tertiary flex items-center justify-center overflow-hidden shrink-0">
                    {app.thumbnail_url ? (
                      <img src={app.thumbnail_url} alt={app.animal_name} className="h-full w-full object-cover" />
                    ) : (
                      <SpeciesIcon className="h-6 w-6 text-text-quaternary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-text-primary group-hover:text-teal-600 transition-colors truncate">
                        {app.animal_name}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.color}`}>{badge.label}</span>
                        <ChevronRight className="h-4 w-4 text-text-quaternary group-hover:text-text-tertiary" />
                      </div>
                    </div>
                    <p className="text-sm text-text-tertiary mt-0.5">
                      {app.shelter_name}{app.shelter_city ? ` · ${app.shelter_city}` : ''}
                    </p>
                    <p className="text-xs text-text-quaternary mt-1">
                      {t('submittedOn', { date: new Date(app.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) })}
                      {app.reviewed_at && ` · ${t('reviewedOn', { date: new Date(app.reviewed_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) })}`}
                    </p>

                    {/* Status timeline stepper */}
                    <div className="mt-3">
                      <ApplicationTimeline status={app.status} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
