'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';

import { useCampaignStore } from '@/lib/stores/campaignStore';
import { useWebManagerStore } from '@/lib/stores/webManagerStore';
import { ROUTES } from '@/lib/constants';

export default function WebManagerCampaignNewPage() {
  const router = useRouter();
  const shelters = useWebManagerStore((s) => s.shelters);
  const fetchShelters = useWebManagerStore((s) => s.fetchShelters);
  const createCampaign = useCampaignStore((s) => s.createCampaign);

  const [shelter, setShelter] = useState<number | ''>('');
  const [titleEs, setTitleEs] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [goal, setGoal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchShelters({ page: 1, page_size: 200 });
  }, [fetchShelters]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!shelter || !titleEs || !goal) {
      setError('Refugio, título y meta son requeridos.');
      return;
    }
    setSaving(true);
    try {
      const created = await createCampaign({
        shelter: Number(shelter),
        title_es: titleEs,
        title_en: titleEn,
        description_es: descriptionEs,
        description_en: descriptionEn,
        goal_amount: goal,
        status: 'draft',
      });
      router.push(ROUTES.WEB_MANAGER_CAMPAIGN_DETAIL(created.id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">Nueva campaña</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Las campañas creadas por el web manager se aprueban automáticamente.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="text-text-secondary">Refugio</span>
          <select
            value={shelter}
            onChange={(e) => setShelter(e.target.value ? Number(e.target.value) : '')}
            className="mt-1 w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
            required
          >
            <option value="">Selecciona un refugio</option>
            {shelters.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-text-secondary">Título (ES)</span>
          <input
            type="text"
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="text-text-secondary">Título (EN)</span>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="text-text-secondary">Descripción (ES)</span>
          <textarea
            value={descriptionEs}
            onChange={(e) => setDescriptionEs(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-border-primary bg-surface-secondary p-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="text-text-secondary">Descripción (EN)</span>
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
          className="bg-teal-600 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Crear campaña'}
        </button>
      </form>
    </div>
  );
}
