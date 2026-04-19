'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { ROUTES } from '@/lib/constants';
import {
  shelterPillAmber,
  shelterPillEmerald,
  shelterPillNeutralSecondary,
  shelterPillNeutralTertiary,
  shelterPillTeal,
} from '@/lib/ui/shelterPanelBadges';

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: shelterPillNeutralSecondary },
  active: { label: 'Activa', color: shelterPillTeal },
  completed: { label: 'Completada', color: shelterPillEmerald },
  paused: { label: 'Pausada', color: shelterPillAmber },
  archived: { label: 'Archivada', color: shelterPillNeutralTertiary },
};

const approvalLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'En revisión', color: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' },
  approved: { label: 'Aprobada', color: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' },
  rejected: { label: 'Rechazada', color: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200' },
};

export default function ShelterCampaignsPage() {
  useRequireAuth();
  const campaigns = useCampaignStore((s) => s.campaigns);
  const loading = useCampaignStore((s) => s.loading);
  const fetchMyCampaigns = useCampaignStore((s) => s.fetchMyCampaigns);

  useEffect(() => {
    void fetchMyCampaigns();
  }, [fetchMyCampaigns]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Mis Campañas</h1>
          <p className="mt-1 text-text-tertiary">Crea y gestiona campañas de recaudación</p>
        </div>
        <Link
          href={ROUTES.SHELTER_CAMPAIGNS + '/nueva'}
          className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-amber-600 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-amber-700 transition-colors text-center"
        >
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
            const ap = approvalLabels[campaign.approval_status];
            return (
              <Link key={campaign.id} href={ROUTES.SHELTER_CAMPAIGN_DETAIL(campaign.id)}
                className="block rounded-xl border border-border-primary bg-surface-primary p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-text-primary">{campaign.title}</h3>
                    <p className="text-sm text-text-tertiary mt-1">
                      Meta: ${Number(campaign.goal_amount).toLocaleString()} · Recaudado: ${Number(campaign.raised_amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ap && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ap.color}`}>{ap.label}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                </div>
                {campaign.approval_status === 'rejected' && (
                  <p className="mt-3 text-xs text-rose-700">
                    Solicitud rechazada. Abre la campaña para leer el motivo y reenviarla.
                  </p>
                )}
                <div className="mt-3 w-full bg-surface-tertiary rounded-full h-2">
                  <div
                    className="bg-amber-500 dark:bg-amber-600 h-2 rounded-full transition-all"
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
