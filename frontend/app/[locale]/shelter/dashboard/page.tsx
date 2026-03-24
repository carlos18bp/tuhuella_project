'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LayoutDashboard, MapPin, ChevronRight } from 'lucide-react';

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
        <div className="space-y-4">
          <div className="h-8 animate-shimmer rounded w-1/3" />
          <div className="h-4 animate-shimmer rounded w-1/2" />
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-stone-200 p-6 h-24 animate-shimmer" />
            ))}
          </div>
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
          className="mt-6 inline-block bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 btn-base shadow-sm">
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
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-800">{shelter.name}</h1>
            <div className="flex items-center gap-1 mt-0.5 text-sm text-stone-500">
              <MapPin className="h-3.5 w-3.5 text-stone-400" />
              {shelter.city}
            </div>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${verificationColor}`}>
          {verificationLabel}
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">{item.label}</h3>
              <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </div>
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
