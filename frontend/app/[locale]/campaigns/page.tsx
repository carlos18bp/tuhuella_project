'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useCampaignStore } from '@/lib/stores/campaignStore';
import { CampaignCard, Container, EmptyState, FAQAccordion } from '@/components/ui';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { useMinWidthMd } from '@/lib/hooks/useMediaQuery';

const MOBILE_PAGE_SIZE = 5;

export default function CampanasPage() {
  const locale = useLocale();
  const t = useTranslations('campaigns');

  const campaigns = useCampaignStore((s) => s.campaigns);
  const loading = useCampaignStore((s) => s.loading);
  const { items: campaignsFaqs } = useFAQsByTopic('campaigns');
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [mobilePage, setMobilePage] = useState(1);
  const isMdUp = useMinWidthMd();

  useEffect(() => {
    void fetchCampaigns(locale, activeTab);
  }, [fetchCampaigns, locale, activeTab]);

  useEffect(() => {
    setMobilePage(1);
  }, [activeTab, campaigns.length]);

  const mobileTotalPages = Math.max(1, Math.ceil(campaigns.length / MOBILE_PAGE_SIZE));

  useEffect(() => {
    if (mobilePage > mobileTotalPages) setMobilePage(mobileTotalPages);
  }, [mobilePage, mobileTotalPages]);

  const displayedCampaigns = useMemo(() => {
    if (isMdUp) return campaigns;
    const start = (mobilePage - 1) * MOBILE_PAGE_SIZE;
    return campaigns.slice(start, start + MOBILE_PAGE_SIZE);
  }, [campaigns, isMdUp, mobilePage]);

  const showMobilePagination = !isMdUp && !loading && campaigns.length > MOBILE_PAGE_SIZE;

  const navBtn =
    'min-h-11 min-w-11 flex items-center justify-center p-2 rounded-lg border border-border-primary text-text-secondary hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors';

  return (
    <Container className="py-10 min-w-0 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary heading-decorated-amber">{t('title')}</h1>
      <p className="mt-2 text-text-tertiary">{t('subtitle')}</p>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl bg-surface-tertiary p-1 w-fit max-w-full overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 min-h-11 sm:min-h-0 ${
            activeTab === 'active'
              ? 'bg-surface-primary text-amber-700 dark:text-amber-300 shadow-sm dark:ring-1 dark:ring-amber-500/20'
              : 'text-text-tertiary hover:text-text-secondary dark:hover:bg-surface-hover/80'
          }`}
        >
          {t('tabActive')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 min-h-11 sm:min-h-0 ${
            activeTab === 'completed'
              ? 'bg-surface-primary text-amber-700 dark:text-amber-300 shadow-sm dark:ring-1 dark:ring-amber-500/20'
              : 'text-text-tertiary hover:text-text-secondary dark:hover:bg-surface-hover/80'
          }`}
        >
          {t('tabCompleted')}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-primary/60 bg-surface-primary p-6 space-y-3 shadow-sm">
                <div className="h-4 animate-shimmer rounded w-1/3" />
                <div className="h-5 animate-shimmer rounded w-2/3" />
                <div className="h-2 animate-shimmer rounded w-full mt-4" />
              </div>
            ))
          : displayedCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        {!loading && campaigns.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 min-w-0">
            <EmptyState message={activeTab === 'active' ? t('noResults') : t('noCompletedResults')} />
          </div>
        )}
      </div>

      {showMobilePagination && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
            disabled={mobilePage <= 1}
            className={navBtn}
            aria-label={t('previous')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-text-secondary tabular-nums min-w-[8rem] text-center">
            {t('pageOfTotal', { page: mobilePage, total: mobileTotalPages })}
          </span>
          <button
            type="button"
            onClick={() => setMobilePage((p) => Math.min(mobileTotalPages, p + 1))}
            disabled={mobilePage >= mobileTotalPages}
            className={navBtn}
            aria-label={t('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {campaignsFaqs.length > 0 && (
        <FAQAccordion
          items={campaignsFaqs}
          title={t('faqTitle')}
          subtitle={t('faqSubtitle')}
        />
      )}
    </Container>
  );
}
