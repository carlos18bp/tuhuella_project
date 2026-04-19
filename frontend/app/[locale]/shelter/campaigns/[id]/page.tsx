'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import CampaignMessageThread from '@/components/campaigns/CampaignMessageThread';

export default function ShelterCampaignDetailPage() {
  useRequireAuth();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const user = useAuthStore((s) => s.user);
  const campaign = useCampaignStore((s) => s.campaign);
  const loading = useCampaignStore((s) => s.loading);
  const fetchCampaign = useCampaignStore((s) => s.fetchCampaign);
  const submitForApproval = useCampaignStore((s) => s.submitForApproval);
  const updateCampaign = useCampaignStore((s) => s.updateCampaign);

  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [titleEs, setTitleEs] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (!id) return;
    void fetchCampaign(id);
  }, [id, fetchCampaign]);

  useEffect(() => {
    if (!campaign) return;
    setTitleEs(campaign.title);
    setDescriptionEs(campaign.description || '');
    setGoal(String(campaign.goal_amount));
  }, [campaign]);

  async function onSaveEdits() {
    setSubmitting(true);
    try {
      await updateCampaign(id, {
        title_es: titleEs,
        description_es: descriptionEs,
        goal_amount: goal,
      });
      setEditing(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function onResubmit() {
    setSubmitting(true);
    try {
      await submitForApproval(id);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !campaign) {
    return <p className="mx-auto max-w-[1400px] px-6 py-10 text-text-tertiary">Cargando...</p>;
  }
  if (!campaign) {
    return <p className="mx-auto max-w-[1400px] px-6 py-10 text-text-tertiary">Campaña no encontrada.</p>;
  }

  const isPending = campaign.approval_status === 'pending';
  const isRejected = campaign.approval_status === 'rejected';
  const canEdit = isPending || isRejected;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{campaign.title}</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Meta ${Number(campaign.goal_amount).toLocaleString()} · Estado de revisión:{' '}
          <span className="font-medium">{campaign.approval_status}</span>
        </p>
      </header>

      {isRejected && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-900">
            Tu solicitud fue rechazada. Revisa los mensajes del equipo para ver qué ajustar.
          </p>
          <button
            type="button"
            onClick={onResubmit}
            disabled={submitting}
            className="mt-3 bg-teal-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            Reenviar a revisión
          </button>
        </div>
      )}

      <section className="rounded-xl border border-border-primary bg-surface-primary p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Datos de la campaña</h2>
          {canEdit && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-teal-700 hover:underline"
            >
              Editar
            </button>
          )}
        </div>
        {editing ? (
          <div className="mt-3 space-y-3">
            <input
              value={titleEs}
              onChange={(e) => setTitleEs(e.target.value)}
              className="w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
            />
            <textarea
              value={descriptionEs}
              onChange={(e) => setDescriptionEs(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
            />
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSaveEdits}
                disabled={submitting}
                className="bg-teal-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={submitting}
                className="bg-surface-tertiary text-text-primary rounded-full px-4 py-2 text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          campaign.description && (
            <p className="mt-3 text-sm text-text-secondary whitespace-pre-wrap">{campaign.description}</p>
          )
        )}
      </section>

      <CampaignMessageThread campaignId={id} currentUserId={user?.id ?? null} />
    </div>
  );
}
