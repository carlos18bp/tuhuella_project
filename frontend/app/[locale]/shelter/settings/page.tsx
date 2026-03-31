'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Shelter } from '@/lib/types';
import { useShelterStore } from '@/lib/stores/shelterStore';

export default function ShelterConfiguracionPage() {
  useRequireAuth();
  const tForm = useTranslations('shelterForm');
  const updateShelter = useShelterStore((s) => s.updateShelter);

  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    legal_name: '',
    description: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.SHELTERS, { params: { owner: 'me' } });
        const shelters = res.data;
        if (shelters.length > 0) {
          const s = shelters[0];
          setShelter(s);
          setForm({
            name: s.name || '',
            legal_name: s.legal_name || '',
            description: s.description || '',
            city: s.city || '',
            address: s.address || '',
            phone: s.phone || '',
            email: s.email || '',
            website: s.website || '',
          });
        }
      } catch {
        // No shelter
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shelter) return;
    setSaving(true);
    try {
      const updated = await updateShelter(shelter.id, form);
      setShelter(updated);
      setSuccess(true);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary bg-surface-primary focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:focus:border-teal-500/60 dark:focus:ring-teal-500/20 outline-none';

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 min-w-0 overflow-x-hidden">
        <div data-testid="loading-skeleton" className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-tertiary rounded w-1/3" />
          <div className="h-40 bg-surface-tertiary rounded" />
        </div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 min-w-0 overflow-x-hidden">
        <p className="text-text-quaternary">No tienes un refugio registrado.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 min-w-0 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Configuración del Refugio</h1>
      <p className="mt-2 text-text-tertiary">Actualiza la información de tu refugio</p>

      <form onSubmit={handleSave} className="mt-8 space-y-5">
        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-300">
            Cambios guardados correctamente
          </div>
        )}

        <div className="rounded-xl border border-teal-200/80 bg-teal-50/70 dark:bg-teal-950/25 dark:border-teal-800/60 p-4 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary">{tForm('privacyTitle')}</p>
          <p className="mt-2 leading-relaxed">{tForm('privacyBody')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Nombre *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="legal_name" className="block text-sm font-medium text-text-secondary">Razón social</label>
            <input id="legal_name" name="legal_name" value={form.legal_name} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Descripción</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-text-secondary">Ciudad *</label>
            <input id="city" name="city" value={form.city} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-text-secondary">Dirección</label>
            <input id="address" name="address" value={form.address} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">Teléfono</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-text-secondary">{tForm('websiteOptional')}</label>
          <input
            id="website"
            name="website"
            type="text"
            inputMode="url"
            autoComplete="url"
            value={form.website}
            onChange={handleChange}
            className={inputClass}
            placeholder="https://"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <span className="text-xs text-text-quaternary">
            Estado: <span className="capitalize">{shelter.verification_status}</span>
          </span>
        </div>
      </form>
    </div>
  );
}
