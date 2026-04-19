'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useCampaignStore } from '@/lib/stores/campaignStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';

export default function ShelterCampaignNewPage() {
  useRequireAuth();
  const router = useRouter();
  const createCampaign = useCampaignStore((s) => s.createCampaign);

  const [shelterId, setShelterId] = useState<number | null>(null);
  const [loadingShelter, setLoadingShelter] = useState(true);
  const [titleEs, setTitleEs] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [goal, setGoal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.SHELTERS, { params: { owner: 'me' } });
        const ids = (res.data as { id: number }[]).map((s) => s.id);
        if (ids.length) setShelterId(ids[0]);
      } finally {
        setLoadingShelter(false);
      }
    };
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!shelterId) {
      setError('No encontramos tu refugio.');
      return;
    }
    if (!titleEs || !goal) {
      setError('Título y meta son requeridos.');
      return;
    }
    setSaving(true);
    try {
      const created = await createCampaign({
        shelter: shelterId,
        title_es: titleEs,
        title_en: titleEn || titleEs,
        description_es: descriptionEs,
        description_en: descriptionEn,
        goal_amount: goal,
        status: 'draft',
      });
      router.push(ROUTES.SHELTER_CAMPAIGN_DETAIL(created.id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loadingShelter) {
    return <p className="mx-auto max-w-[1400px] px-6 py-10 text-text-tertiary">Cargando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">Solicitar nueva campaña</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Tu campaña pasará por revisión antes de publicarse. El equipo te avisará si falta algo.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="text-text-secondary">Título</span>
          <input
            type="text"
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-text-secondary">Title (EN, opcional)</span>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-text-secondary">Descripción</span>
          <textarea
            value={descriptionEs}
            onChange={(e) => setDescriptionEs(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-text-secondary">Description (EN, opcional)</span>
          <textarea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-text-secondary">Meta (COP)</span>
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
            min="0"
            step="1"
            required
          />
        </label>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-amber-600 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          {saving ? 'Enviando...' : 'Enviar para revisión'}
        </button>
      </form>
    </div>
  );
}
