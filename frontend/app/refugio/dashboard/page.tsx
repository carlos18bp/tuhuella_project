'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import type { Shelter } from '@/lib/types';

export default function ShelterDashboardPage() {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.SHELTERS, { params: { owner: 'me' } });
        const shelters = res.data;
        if (shelters.length > 0) setShelter(shelters[0]);
      } catch {
        // No shelter
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-100 rounded w-1/3" />
          <div className="h-4 bg-stone-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10 text-center py-20">
        <h1 className="text-2xl font-bold text-stone-800">No tienes un refugio registrado</h1>
        <p className="mt-2 text-stone-500">Registra tu refugio para comenzar a gestionar animales.</p>
        <Link href={ROUTES.SHELTER_ONBOARDING}
          className="mt-6 inline-block bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors">
          Registrar refugio
        </Link>
      </div>
    );
  }

  const verificationColor = shelter.verification_status === 'verified'
    ? 'bg-emerald-50 text-emerald-700'
    : shelter.verification_status === 'pending'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-red-50 text-red-700';

  const verificationLabel = shelter.verification_status === 'verified'
    ? 'Verificado'
    : shelter.verification_status === 'pending'
      ? 'Pendiente de verificación'
      : 'Rechazado';

  const navItems = [
    { label: 'Animales', href: ROUTES.SHELTER_ANIMALS, description: 'Gestiona tus animales en adopción' },
    { label: 'Solicitudes', href: ROUTES.SHELTER_APPLICATIONS, description: 'Revisa solicitudes de adopción' },
    { label: 'Campañas', href: ROUTES.SHELTER_CAMPAIGNS, description: 'Crea y gestiona campañas de recaudación' },
    { label: 'Donaciones', href: ROUTES.SHELTER_DONATIONS, description: 'Consulta las donaciones recibidas' },
    { label: 'Configuración', href: ROUTES.SHELTER_SETTINGS, description: 'Actualiza la información de tu refugio' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">{shelter.name}</h1>
          <p className="mt-1 text-stone-500">{shelter.city}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${verificationColor}`}>
          {verificationLabel}
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className="rounded-2xl border border-stone-200 bg-white p-6 hover:shadow-md transition-shadow group">
            <h3 className="font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">{item.label}</h3>
            <p className="text-sm text-stone-500 mt-1">{item.description}</p>
          </Link>
        ))}
      </div>

      {user?.role !== 'shelter_admin' && (
        <p className="mt-6 text-xs text-amber-600">
          Tu rol actual es &quot;{user?.role}&quot;. Algunas funciones pueden estar restringidas.
        </p>
      )}
    </div>
  );
}
