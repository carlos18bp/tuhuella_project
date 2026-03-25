'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Calendar, Megaphone, FileText, Camera, X } from 'lucide-react';

import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { FAQAccordion } from '@/components/ui';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { api } from '@/lib/services/http';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = Number(params.campaignId);
  const locale = useLocale();
  const t = useTranslations('campaigns');
  const tCommon = useTranslations('common');

  const campaign = useCampaignStore((s) => s.campaign);
  const loading = useCampaignStore((s) => s.loading);
  const fetchCampaign = useCampaignStore((s) => s.fetchCampaign);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const tUpdates = useTranslations('updates');
  const [updates, setUpdates] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (campaignId) {
      api.get(API_ENDPOINTS.UPDATES, { params: { campaign: campaignId, lang: locale } })
        .then((res) => setUpdates(res.data))
        .catch(() => {});
    }
  }, [campaignId, locale]);

  const { items: campaignFaqs } = useFAQsByTopic(`campaign-${campaignId}`);
  const { items: generalFaqs } = useFAQsByTopic('campaigns');
  const faqItems = campaignFaqs.length > 0 ? campaignFaqs : generalFaqs;

  useEffect(() => {
    if (campaignId) void fetchCampaign(campaignId, locale);
  }, [campaignId, fetchCampaign, locale]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading || !campaign) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10 space-y-4">
        <div className="h-8 animate-shimmer rounded w-1/3" />
        <div className="aspect-[21/9] animate-shimmer rounded-2xl" />
        <div className="h-4 animate-shimmer rounded w-2/3" />
        <div className="h-3 animate-shimmer rounded w-full mt-4" />
      </div>
    );
  }

  const startsAt = formatDate(campaign.starts_at);
  const endsAt = formatDate(campaign.ends_at);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <Link href={ROUTES.CAMPAIGNS} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {t('backToCampaigns')}
      </Link>

      {/* Cover image */}
      {campaign.cover_image_url ? (
        <div className="mt-6 rounded-2xl overflow-hidden border border-stone-200">
          <img
            src={campaign.cover_image_url}
            alt={campaign.title}
            className="w-full aspect-[21/9] object-cover"
          />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl overflow-hidden border border-stone-200 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center aspect-[21/9]">
          <Megaphone className="h-16 w-16 text-amber-300" />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Content column */}
        <div className="lg:col-span-2">
          <p className="text-sm text-amber-600 font-medium">{campaign.shelter_name}</p>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-stone-800 mt-2">{campaign.title}</h1>

          {(startsAt || endsAt) && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-stone-500">
              {startsAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {t('start')}: {startsAt}
                </span>
              )}
              {endsAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {t('end')}: {endsAt}
                </span>
              )}
            </div>
          )}

          {campaign.description && (
            <p className="mt-6 text-stone-600 leading-relaxed whitespace-pre-line">{campaign.description}</p>
          )}
        </div>

        {/* Donation card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-lg ring-1 ring-stone-200/50">
            <h3 className="text-lg font-semibold text-stone-800">{t('progress')}</h3>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-stone-600 mb-2">
                <span>{campaign.progress_percentage}% {t('completed')}</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all progress-shine"
                  style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="font-semibold text-stone-800">
                  ${Number(campaign.raised_amount).toLocaleString()}
                </span>
                <span className="text-stone-500">
                  {t('of')} ${Number(campaign.goal_amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6">
              {isAuthenticated ? (
                <Link
                  href={`${ROUTES.CHECKOUT_DONATION}?campaign=${campaign.id}`}
                  className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-sm hover:shadow-md text-white rounded-full px-6 py-3 font-medium btn-base text-center"
                >
                  {t('donateButton')}
                </Link>
              ) : (
                <Link
                  href={ROUTES.SIGN_IN}
                  className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-sm hover:shadow-md text-white rounded-full px-6 py-3 font-medium btn-base text-center"
                >
                  {t('signInToDonate')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Gallery (for completed campaigns) */}
      {campaign.status === 'completed' && campaign.evidence_gallery_urls && campaign.evidence_gallery_urls.length > 0 && (
        <div className="mt-16 border-t border-stone-200 pt-10">
          <div className="flex items-center gap-2 mb-6">
            <Camera className="h-5 w-5 text-amber-600" />
            <div>
              <h2 className="text-xl font-bold text-stone-800">{t('evidenceTitle')}</h2>
              <p className="text-sm text-stone-500">{t('evidenceSubtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {campaign.evidence_gallery_urls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className="rounded-xl overflow-hidden aspect-square hover:opacity-90 transition-opacity"
              >
                <img src={url} alt={`${t('evidenceTitle')} ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && campaign.evidence_gallery_urls && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-stone-300" onClick={() => setLightboxIndex(null)}>
            <X className="h-8 w-8" />
          </button>
          <img
            src={campaign.evidence_gallery_urls[lightboxIndex]}
            alt=""
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Updates / Evidence feed */}
      {updates.length > 0 && (
        <div className="mt-16 border-t border-stone-200 pt-10">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-bold text-stone-800">{tUpdates('feedTitle')}</h2>
          </div>
          <div className="space-y-4">
            {updates.map((update: any) => (
              <div key={update.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  {update.image_url && (
                    <img
                      src={update.image_url}
                      alt={update.title}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-800">{update.title}</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      {update.shelter_name} &middot;{' '}
                      {new Date(update.created_at).toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ section */}
      {faqItems.length > 0 && (
        <div className="mt-16 border-t border-stone-200 pt-2">
          <FAQAccordion
            items={faqItems}
            title={tCommon('faq')}
            subtitle={t('faqSubtitle')}
          />
        </div>
      )}
    </div>
  );
}
