'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useShelterStore } from '@/lib/stores/shelterStore';
import { ShelterCard, EmptyState, FAQAccordion } from '@/components/ui';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';

export default function RefugiosPage() {
  const locale = useLocale();
  const t = useTranslations('shelters');

  const shelters = useShelterStore((s) => s.shelters);
  const loading = useShelterStore((s) => s.loading);
  const { items: sheltersFaqs } = useFAQsByTopic('shelters');
  const fetchShelters = useShelterStore((s) => s.fetchShelters);

  useEffect(() => {
    void fetchShelters(locale);
  }, [fetchShelters, locale]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary heading-decorated">{t('title')}</h1>
      <p className="mt-2 text-text-tertiary">{t('subtitle')}</p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-primary/60 bg-surface-primary p-6 space-y-3 shadow-sm">
                <div className="h-5 animate-shimmer rounded w-2/3" />
                <div className="h-3 animate-shimmer rounded w-1/2" />
              </div>
            ))
          : shelters.map((shelter) => (
              <ShelterCard key={shelter.id} shelter={shelter} />
            ))}
        {!loading && shelters.length === 0 && (
          <EmptyState message={t('noResults')} />
        )}
      </div>

      {sheltersFaqs.length > 0 && (
        <FAQAccordion
          items={sheltersFaqs}
          title={t('faqTitle')}
          subtitle={t('faqSubtitle')}
        />
      )}
    </div>
  );
}
