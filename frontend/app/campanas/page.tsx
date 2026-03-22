'use client';

import { useEffect } from 'react';

import { useCampaignStore } from '@/lib/stores/campaignStore';
import { CampaignCard, EmptyState } from '@/components/ui';

export default function CampanasPage() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const loading = useCampaignStore((s) => s.loading);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);

  useEffect(() => {
    if (campaigns.length === 0) void fetchCampaigns();
  }, [fetchCampaigns, campaigns.length]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Campañas activas</h1>
      <p className="mt-2 text-stone-500">Tu donación hace la diferencia</p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-stone-200 bg-white p-6 animate-pulse space-y-3">
                <div className="h-4 bg-stone-100 rounded w-1/3" />
                <div className="h-5 bg-stone-100 rounded w-2/3" />
                <div className="h-2 bg-stone-100 rounded w-full mt-4" />
              </div>
            ))
          : campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        {!loading && campaigns.length === 0 && (
          <EmptyState message="No hay campañas activas por el momento." icon="📢" />
        )}
      </div>
    </div>
  );
}
