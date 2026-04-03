'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { AnimalCard, AnimalCardList, Container, EmptyState, MultiSelectDropdown, FAQAccordion } from '@/components/ui';
import type { MultiSelectOption } from '@/components/ui/MultiSelectDropdown';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';

export default function AnimalesPage() {
  const locale = useLocale();
  const t = useTranslations('animals');

  const animals = useAnimalStore((s) => s.animals);
  const loading = useAnimalStore((s) => s.loading);
  const pagination = useAnimalStore((s) => s.pagination);
  const fetchAnimals = useAnimalStore((s) => s.fetchAnimals);
  const setFilters = useAnimalStore((s) => s.setFilters);
  const setPage = useAnimalStore((s) => s.setPage);

  const { items: animalsFaqs } = useFAQsByTopic('animals');

  const [species, setSpecies] = useState<string[]>([]);
  const [size, setSize] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<string[]>([]);
  const [goodWith, setGoodWith] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const speciesOptions: MultiSelectOption[] = [
    { value: 'dog', label: t('dogs') },
    { value: 'cat', label: t('cats') },
    { value: 'other', label: t('others') },
  ];

  const sizeOptions: MultiSelectOption[] = [
    { value: 'small', label: t('small') },
    { value: 'medium', label: t('medium') },
    { value: 'large', label: t('large') },
  ];

  const ageOptions: MultiSelectOption[] = [
    { value: 'puppy', label: t('puppy') },
    { value: 'young', label: t('young') },
    { value: 'adult', label: t('adult') },
    { value: 'senior', label: t('senior') },
  ];

  const energyOptions: MultiSelectOption[] = [
    { value: 'low', label: t('energyLow') },
    { value: 'medium', label: t('energyMedium') },
    { value: 'high', label: t('energyHigh') },
  ];

  const goodWithOptions: MultiSelectOption[] = [
    { value: 'kids', label: t('goodWithKids') },
    { value: 'dogs', label: t('goodWithDogs') },
    { value: 'cats', label: t('goodWithCats') },
  ];

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (species.length > 0) filters.species = species.join(',');
    if (size.length > 0) filters.size = size.join(',');
    if (ageRange.length > 0) filters.age_range = ageRange.join(',');
    if (energyLevel.length > 0) filters.energy_level = energyLevel.join(',');
    // Good-with filters: each selected value maps to a separate query param with value 'yes'
    for (const gw of goodWith) {
      if (gw === 'kids') filters.good_with_kids = 'yes';
      if (gw === 'dogs') filters.good_with_dogs = 'yes';
      if (gw === 'cats') filters.good_with_cats = 'yes';
    }
    setFilters(filters);
    void fetchAnimals(filters, locale, 1);
  }, [species, size, ageRange, energyLevel, goodWith, fetchAnimals, setFilters, locale]);

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages: number[] = [];
    const { page, totalPages } = pagination;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);

    const navBtn =
      'min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 flex items-center justify-center p-2 rounded-lg border border-border-primary text-text-secondary hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors';

    return (
      <>
        {/* Compact: mobile */}
        <div className="mt-10 flex sm:hidden items-center justify-center gap-3">
          <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className={navBtn} aria-label={t('previous')}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-text-secondary tabular-nums min-w-[8rem] text-center">
            {t('pageOfTotal', { page, total: totalPages })}
          </span>
          <button type="button" onClick={() => setPage(page + 1)} disabled={page >= totalPages} className={navBtn} aria-label={t('next')}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {/* Full window: sm+ */}
        <div className="mt-10 hidden sm:flex items-center justify-center gap-2 flex-wrap">
          <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className={navBtn} aria-label={t('previous')}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          {start > 1 && (
            <>
              <button type="button" onClick={() => setPage(1)} className="min-h-9 min-w-9 px-2 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors">1</button>
              {start > 2 && <span className="text-text-quaternary">...</span>}
            </>
          )}
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`min-h-9 min-w-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-teal-600 text-white'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {p}
            </button>
          ))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="text-text-quaternary">...</span>}
              <button type="button" onClick={() => setPage(totalPages)} className="min-h-9 min-w-9 px-2 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors">{totalPages}</button>
            </>
          )}
          <button type="button" onClick={() => setPage(page + 1)} disabled={page >= totalPages} className={navBtn} aria-label={t('next')}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </>
    );
  };

  return (
    <Container className="py-10 min-w-0 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary heading-decorated">{t('title')}</h1>
      <p className="mt-2 text-text-tertiary">{t('subtitle')}</p>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap rounded-2xl bg-surface-secondary/80 border border-border-primary/60 p-4 min-w-0">
        <MultiSelectDropdown
          className="w-full sm:w-auto"
          label={t('speciesFilter')}
          options={speciesOptions}
          selected={species}
          onChange={setSpecies}
        />
        <MultiSelectDropdown
          className="w-full sm:w-auto"
          label={t('sizeFilter')}
          options={sizeOptions}
          selected={size}
          onChange={setSize}
        />
        <MultiSelectDropdown
          className="w-full sm:w-auto"
          label={t('ageFilter')}
          options={ageOptions}
          selected={ageRange}
          onChange={setAgeRange}
        />
        <MultiSelectDropdown
          className="w-full sm:w-auto"
          label={t('energyFilter')}
          options={energyOptions}
          selected={energyLevel}
          onChange={setEnergyLevel}
        />
        <MultiSelectDropdown
          className="w-full sm:w-auto"
          label={t('compatibilityFilter')}
          options={goodWithOptions}
          selected={goodWith}
          onChange={setGoodWith}
        />
      </div>

      {/* View toggle */}
      <div className="mt-6 flex justify-end">
        <div className="flex items-center gap-1 rounded-lg border border-border-primary/60 p-1 bg-surface-secondary/50">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-text-tertiary hover:bg-surface-hover'}`}
            aria-label={t('viewGrid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-text-tertiary hover:bg-surface-hover'}`}
            aria-label={t('viewList')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Animals */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-7 min-w-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-primary bg-surface-primary overflow-hidden">
                <div className="aspect-[4/3] animate-shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 animate-shimmer rounded w-2/3" />
                  <div className="h-3 animate-shimmer rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3 min-w-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex rounded-2xl border border-border-primary bg-surface-primary overflow-hidden">
                <div className="w-28 sm:w-36 shrink-0 animate-shimmer" />
                <div className="flex-1 p-4 space-y-2">
                  <div className="h-4 animate-shimmer rounded w-2/3" />
                  <div className="h-3 animate-shimmer rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {animals.length === 0 ? (
            <div className="mt-4">
              <EmptyState message={t('noResults')} />
            </div>
          ) : viewMode === 'grid' ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-7 min-w-0">
              {animals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 min-w-0">
              {animals.map((animal) => (
                <AnimalCardList key={animal.id} animal={animal} />
              ))}
            </div>
          )}
          {renderPagination()}
        </>
      )}

      {animalsFaqs.length > 0 && (
        <FAQAccordion
          items={animalsFaqs}
          title={t('faqTitle')}
          subtitle={t('faqSubtitle')}
        />
      )}
    </Container>
  );
}
