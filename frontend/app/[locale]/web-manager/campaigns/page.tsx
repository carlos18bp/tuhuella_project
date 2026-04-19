'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { ChevronRight, Plus } from 'lucide-react';

import { useWebManagerStore } from '@/lib/stores/webManagerStore';
import { ROUTES } from '@/lib/constants';
import type { CampaignApprovalStatus } from '@/lib/types';

const TABS: { key: CampaignApprovalStatus | ''; label: string }[] = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobadas' },
  { key: 'rejected', label: 'Rechazadas' },
  { key: '', label: 'Todas' },
];

export default function WebManagerCampaignsPage() {
  const campaigns = useWebManagerStore((s) => s.campaigns);
  const meta = useWebManagerStore((s) => s.campaignsMeta);
  const loading = useWebManagerStore((s) => s.campaignsLoading);
  const fetchCampaigns = useWebManagerStore((s) => s.fetchCampaigns);
  const [tab, setTab] = useState<CampaignApprovalStatus | ''>('pending');

  useEffect(() => {
    void fetchCampaigns({
      approval_status: tab || undefined,
      page: 1,
      page_size: 25,
    });
  }, [fetchCampaigns, tab]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Campañas</h1>
          <p className="text-sm text-text-tertiary mt-1">
            Revisa solicitudes de refugios y gestiona campañas activas.
          </p>
        </div>
        <Link
          href={ROUTES.WEB_MANAGER_CAMPAIGN_NEW}
          className="inline-flex items-center gap-2 bg-teal-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nueva campaña
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key || 'all'}
            type="button"
            onClick={() => setTab(t.key)}
            className={`text-xs px-3 py-1.5 rounded-full ring-1 transition-colors ${
              tab === t.key
                ? 'bg-teal-600 text-white ring-teal-600'
                : 'bg-surface-primary text-text-secondary ring-border-primary hover:bg-surface-hover'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {meta && (
        <p className="text-xs text-text-quaternary">{meta.count} resultados</p>
      )}

      {loading ? (
        <div role="status" aria-label="loading" className="py-10 text-center text-text-tertiary">
          Cargando...
        </div>
      ) : campaigns.length === 0 ? (
        <p className="py-8 text-center text-text-tertiary">No hay campañas en este estado.</p>
      ) : (
        <ul className="space-y-3">
          {campaigns.map((c) => (
            <li key={c.id}>
              <Link
                href={ROUTES.WEB_MANAGER_CAMPAIGN_DETAIL(c.id)}
                className="flex items-center justify-between rounded-2xl border border-border-primary bg-surface-primary p-4 hover:bg-surface-hover transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">{c.title}</p>
                  <p className="text-xs text-text-tertiary">
                    {c.shelter_name} · Meta ${Number(c.goal_amount).toLocaleString()} · {c.approval_status}
                  </p>
                  {c.submitted_at && (
                    <p className="text-[11px] text-text-quaternary">
                      Enviada: {new Date(c.submitted_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-text-quaternary shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
