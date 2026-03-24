'use client';

import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES } from '@/lib/constants';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = Number(params.campaignId);

  const campaign = useCampaignStore((s) => s.campaign);
  const loading = useCampaignStore((s) => s.loading);
  const fetchCampaign = useCampaignStore((s) => s.fetchCampaign);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (campaignId) void fetchCampaign(campaignId);
  }, [campaignId, fetchCampaign]);

  if (loading || !campaign) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-stone-100 rounded w-1/3" />
        <div className="h-4 bg-stone-100 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <Link href={ROUTES.CAMPAIGNS} className="text-sm text-amber-600 hover:text-amber-700">
        &larr; Volver a campañas
      </Link>

      <div className="mt-6 max-w-3xl">
        <p className="text-sm text-amber-600 font-medium">{campaign.shelter_name}</p>
        <h1 className="text-3xl font-bold text-stone-800 mt-2">{campaign.title}</h1>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-stone-600 mb-2">
            <span>{campaign.progress_percentage}% completado</span>
            <span>
              ${Number(campaign.raised_amount).toLocaleString()} / ${Number(campaign.goal_amount).toLocaleString()}
            </span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
            />
          </div>
        </div>

        {campaign.description && (
          <p className="mt-8 text-stone-600 leading-relaxed">{campaign.description}</p>
        )}

        <div className="mt-8">
          {isAuthenticated ? (
            <Link
              href={`${ROUTES.CHECKOUT_DONATION}?campaign=${campaign.id}`}
              className="bg-amber-500 text-white rounded-full px-6 py-3 font-medium hover:bg-amber-600 transition-colors inline-block"
            >
              Donar a esta campaña
            </Link>
          ) : (
            <Link
              href={ROUTES.SIGN_IN}
              className="bg-amber-500 text-white rounded-full px-6 py-3 font-medium hover:bg-amber-600 transition-colors inline-block"
            >
              Inicia sesión para donar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
