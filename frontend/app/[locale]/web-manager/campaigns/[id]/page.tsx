'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { useAuthStore } from '@/lib/stores/authStore';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useWebManagerStore } from '@/lib/stores/webManagerStore';
import CampaignMessageThread from '@/components/campaigns/CampaignMessageThread';
import type { Campaign } from '@/lib/types';

export default function WebManagerCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const user = useAuthStore((s) => s.user);
  const storedCampaign = useCampaignStore((s) => s.campaign);
  const loading = useCampaignStore((s) => s.loading);
  const fetchCampaign = useCampaignStore((s) => s.fetchCampaign);

  const approveCampaign = useWebManagerStore((s) => s.approveCampaign);
  const rejectCampaign = useWebManagerStore((s) => s.rejectCampaign);

  const [localCampaign, setLocalCampaign] = useState<Campaign | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const campaign = localCampaign ?? storedCampaign;

  useEffect(() => {
    if (id) void fetchCampaign(id);
  }, [id, fetchCampaign]);

  async function onApprove() {
    setSubmitting(true);
    try {
      const updated = await approveCampaign(id);
      setLocalCampaign(updated);
    } finally {
      setSubmitting(false);
    }
  }

  async function onReject() {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      const updated = await rejectCampaign(id, reason.trim());
      setLocalCampaign(updated);
      setReason('');
      setShowReject(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !campaign) {
    return <p className="text-text-tertiary">Cargando...</p>;
  }
  if (!campaign) {
    return <p className="text-text-tertiary">Campaña no encontrada.</p>;
  }

  const isPending = campaign.approval_status === 'pending';
  const isRejected = campaign.approval_status === 'rejected';
  const isApproved = campaign.approval_status === 'approved';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">{campaign.title}</h1>
        <p className="text-sm text-text-tertiary mt-1">
          {campaign.shelter_name} · Meta ${Number(campaign.goal_amount).toLocaleString()}
        </p>
        <p className="mt-2">
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full ring-1 ${
              isApproved
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                : isRejected
                ? 'bg-rose-50 text-rose-800 ring-rose-200'
                : 'bg-amber-50 text-amber-800 ring-amber-200'
            }`}
          >
            {campaign.approval_status}
          </span>
          {campaign.reviewed_by_name && (
            <span className="ml-2 text-xs text-text-quaternary">
              Revisada por {campaign.reviewed_by_name}
              {campaign.reviewed_at && ` · ${new Date(campaign.reviewed_at).toLocaleString()}`}
            </span>
          )}
        </p>
      </header>

      {campaign.description && (
        <section className="rounded-xl border border-border-primary bg-surface-primary p-5">
          <h2 className="text-sm font-semibold text-text-primary">Descripción</h2>
          <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">{campaign.description}</p>
        </section>
      )}

      {isPending && (
        <section className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onApprove}
            disabled={submitting}
            className="bg-emerald-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            Aprobar
          </button>
          <button
            type="button"
            onClick={() => setShowReject((v) => !v)}
            disabled={submitting}
            className="bg-rose-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
          >
            Rechazar
          </button>
          {showReject && (
            <div className="w-full mt-3 space-y-2">
              <label className="block text-sm text-text-secondary">Motivo del rechazo</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
                rows={3}
                placeholder="Explica qué falta o por qué no se aprueba..."
              />
              <button
                type="button"
                onClick={onReject}
                disabled={!reason.trim() || submitting}
                className="bg-rose-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
              >
                Confirmar rechazo
              </button>
            </div>
          )}
        </section>
      )}

      <CampaignMessageThread campaignId={id} currentUserId={user?.id ?? null} />
    </div>
  );
}
