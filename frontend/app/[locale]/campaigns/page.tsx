'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useCampaignStore } from '@/lib/stores/campaignStore';
import { CampaignCard, EmptyState, FAQAccordion } from '@/components/ui';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';

export default function CampanasPage() {
  const locale = useLocale();
  const t = useTranslations('campaigns');

  const campaigns = useCampaignStore((s) => s.campaigns);
  const loading = useCampaignStore((s) => s.loading);
  const { items: campaignsFaqs } = useFAQsByTopic('campaigns');
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    void fetchCampaigns(locale, activeTab);
  }, [fetchCampaigns, locale, activeTab]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary heading-decorated-amber">{t('title')}</h1>
      <p className="mt-2 text-text-tertiary">{t('subtitle')}</p>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl bg-surface-tertiary p-1 w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-surface-primary text-amber-700 shadow-sm'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          {t('tabActive')}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-surface-primary text-amber-700 shadow-sm'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          {t('tabCompleted')}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-primary/60 bg-surface-primary p-6 space-y-3 shadow-sm">
                <div className="h-4 animate-shimmer rounded w-1/3" />
                <div className="h-5 animate-shimmer rounded w-2/3" />
                <div className="h-2 animate-shimmer rounded w-full mt-4" />
              </div>
            ))
          : campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        {!loading && campaigns.length === 0 && (
          <EmptyState message={activeTab === 'active' ? t('noResults') : t('noCompletedResults')} />
        )}
      </div>

      {campaignsFaqs.length > 0 && (
        <FAQAccordion
          items={campaignsFaqs}
          title={t('faqTitle')}
          subtitle={t('faqSubtitle')}
        />
      )}
    </div>
  );
}
