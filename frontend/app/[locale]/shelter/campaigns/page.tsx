'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { ROUTES } from '@/lib/constants';

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-surface-tertiary text-text-secondary' },
  active: { label: 'Activa', color: 'bg-teal-50 text-teal-700' },
  completed: { label: 'Completada', color: 'bg-emerald-50 text-emerald-700' },
  paused: { label: 'Pausada', color: 'bg-amber-50 text-amber-700' },
  archived: { label: 'Archivada', color: 'bg-surface-tertiary text-text-tertiary' },
};

export default function ShelterCampaignsPage() {
  useRequireAuth();
  const campaigns = useCampaignStore((s) => s.campaigns);
  const loading = useCampaignStore((s) => s.loading);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Mis Campañas</h1>
          <p className="mt-1 text-text-tertiary">Crea y gestiona campañas de recaudación</p>
        </div>
        <Link href={ROUTES.SHELTER_CAMPAIGNS + '/nueva'}
          className="bg-amber-600 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-amber-700 transition-colors text-center">
          + Nueva campaña
        </Link>
      </div>

      {loading ? (
        <div data-testid="loading-skeleton" className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-5 animate-pulse">
              <div className="h-5 bg-surface-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <p className="mt-8 text-text-quaternary">No tienes campañas creadas.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {campaigns.map((campaign) => {
            const st = statusLabels[campaign.status] ?? { label: campaign.status, color: 'bg-surface-tertiary text-text-secondary' };
            return (
              <Link key={campaign.id} href={ROUTES.CAMPAIGN_DETAIL(campaign.id)}
                className="block rounded-xl border border-border-primary bg-surface-primary p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-text-primary">{campaign.title}</h3>
                    <p className="text-sm text-text-tertiary mt-1">
                      Meta: ${Number(campaign.goal_amount).toLocaleString()} · Recaudado: ${Number(campaign.raised_amount).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <div className="mt-3 w-full bg-surface-tertiary rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${campaign.progress_percentage}%` }}
                  />
                </div>
                <p className="text-xs text-text-quaternary mt-1">{campaign.progress_percentage}% completado</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
