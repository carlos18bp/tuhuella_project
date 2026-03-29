'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useShelterStore } from '@/lib/stores/shelterStore';
import { ROUTES } from '@/lib/constants';

export default function ShelterOnboardingPage() {
  useRequireAuth();
  const router = useRouter();
  const createShelter = useShelterStore((s) => s.createShelter);

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) {
      setError('El nombre y la ciudad son obligatorios');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createShelter(form);
      router.push(ROUTES.SHELTER_DASHBOARD);
    } catch {
      setError('Error al registrar el refugio. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary">Registrar Refugio</h1>
      <p className="mt-2 text-text-tertiary">
        Completa la información de tu refugio. Será revisado por nuestro equipo antes de ser publicado.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Nombre del refugio *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required
              className="mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label htmlFor="legal_name" className="block text-sm font-medium text-text-secondary">Razón social</label>
            <input id="legal_name" name="legal_name" value={form.legal_name} onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Descripción</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3}
            className="mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            placeholder="Cuéntanos sobre tu refugio, misión, historia..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-text-secondary">Ciudad *</label>
            <input id="city" name="city" value={form.city} onChange={handleChange} required
              className="mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-text-secondary">Dirección</label>
            <input id="address" name="address" value={form.address} onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">Teléfono</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email del refugio</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-text-secondary">Sitio web</label>
          <input id="website" name="website" type="url" value={form.website} onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            placeholder="https://" />
        </div>

        <button type="submit" disabled={submitting}
          className="bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
          {submitting ? 'Registrando...' : 'Registrar refugio'}
        </button>
      </form>
    </div>
  );
}
