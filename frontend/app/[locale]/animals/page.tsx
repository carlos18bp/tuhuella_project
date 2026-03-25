'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { AnimalCard, EmptyState, MultiSelectDropdown, FAQAccordion } from '@/components/ui';
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

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (species.length > 0) filters.species = species.join(',');
    if (size.length > 0) filters.size = size.join(',');
    if (ageRange.length > 0) filters.age_range = ageRange.join(',');
    setFilters(filters);
    void fetchAnimals(filters, locale, 1);
  }, [species, size, ageRange, fetchAnimals, setFilters, locale]);

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages: number[] = [];
    const { page, totalPages } = pagination;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="mt-10 flex items-center justify-center gap-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {start > 1 && (
          <>
            <button onClick={() => setPage(1)} className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">1</button>
            {start > 2 && <span className="text-stone-400">...</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-teal-600 text-white'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-stone-400">...</span>}
            <button onClick={() => setPage(totalPages)} className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">{totalPages}</button>
          </>
        )}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800 heading-decorated">{t('title')}</h1>
      <p className="mt-2 text-stone-500">{t('subtitle')}</p>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-3 rounded-2xl bg-stone-50/80 border border-stone-200/60 p-4">
        <MultiSelectDropdown
          label={t('speciesFilter')}
          options={speciesOptions}
          selected={species}
          onChange={setSpecies}
        />
        <MultiSelectDropdown
          label={t('sizeFilter')}
          options={sizeOptions}
          selected={size}
          onChange={setSize}
        />
        <MultiSelectDropdown
          label={t('ageFilter')}
          options={ageOptions}
          selected={ageRange}
          onChange={setAgeRange}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
              <div className="aspect-[4/3] animate-shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-4 animate-shimmer rounded w-2/3" />
                <div className="h-3 animate-shimmer rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {animals.length === 0 && (
              <EmptyState message={t('noResults')} />
            )}
            {animals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
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
    </div>
  );
}
