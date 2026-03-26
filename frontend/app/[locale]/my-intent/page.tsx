'use client';

import { useEffect, useState } from 'react';

import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { AdopterIntent } from '@/lib/types';

export default function MiIntencionPage() {
  const user = useAuthStore((s) => s.user);
  const [intent, setIntent] = useState<AdopterIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.ADOPTER_INTENT_ME);
        setIntent(res.data);
        setDescription(res.data.description || '');
        setVisibility(res.data.visibility || 'public');
      } catch {
        // No intent yet
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { description, visibility };
      if (intent) {
        const res = await api.patch(API_ENDPOINTS.ADOPTER_INTENT_ME, payload);
        setIntent(res.data);
      } else {
        const res = await api.post(API_ENDPOINTS.ADOPTER_INTENT_CREATE, payload);
        setIntent(res.data);
      }
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <p className="text-text-quaternary">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary heading-decorated">Mi Intención de Adopción</h1>
      <p className="mt-2 text-text-tertiary">
        Comparte lo que buscas y deja que los refugios te encuentren
      </p>

      {loading ? (
        <div className="mt-8 max-w-lg space-y-4">
          <div className="rounded-xl border border-border-primary p-6">
            <div className="h-5 animate-shimmer rounded w-2/3" />
            <div className="h-20 animate-shimmer rounded mt-4" />
          </div>
        </div>
      ) : (
        <div className="mt-8 max-w-lg space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary">
              Cuéntanos qué buscas
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-border-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] p-3 text-sm text-text-primary placeholder:text-text-quaternary focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-colors"
              placeholder="Describe qué tipo de animal te gustaría adoptar, tu situación, espacio disponible..."
            />
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-text-secondary">
              Visibilidad
            </label>
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              className="mt-2 w-full rounded-xl border border-border-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="public">Pública — los refugios pueden ver tu intención</option>
              <option value="private">Privada — solo tú la ves</option>
            </select>
          </div>

          {intent && (
            <div className="rounded-xl border border-border-primary p-4 bg-surface-secondary">
              <p className="text-xs text-text-tertiary">Estado actual</p>
              <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${
                intent.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                intent.status === 'matched' ? 'bg-teal-50 text-teal-700' :
                'bg-surface-tertiary text-text-secondary'
              }`}>
                {intent.status === 'active' ? 'Activa' : intent.status === 'matched' ? 'Emparejada' : 'Pausada'}
              </span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-6 py-2.5 text-sm font-medium btn-base disabled:opacity-50"
          >
            {saving ? 'Guardando...' : intent ? 'Actualizar intención' : 'Crear intención'}
          </button>
        </div>
      )}
    </div>
  );
}
