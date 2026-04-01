'use client';

import { useEffect, useState } from 'react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import AdminAccessDenied from '@/components/ui/AdminAccessDenied';
import type { Animal, Shelter } from '@/lib/types';
import { shelterPillTeal, shelterVerificationPillClass } from '@/lib/ui/shelterPanelBadges';

export default function AdminModeracionPage() {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [animalsRes, sheltersRes] = await Promise.all([
          api.get(API_ENDPOINTS.ANIMALS, { params: { status: 'published' } }),
          api.get(API_ENDPOINTS.SHELTERS),
        ]);
        setAnimals(animalsRes.data.slice(0, 20));
        setShelters(sheltersRes.data.slice(0, 10));
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (user && user.role !== 'admin' && !user.is_staff) {
    return <AdminAccessDenied>Acceso denegado.</AdminAccessDenied>;
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 min-w-0 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Moderación</h1>
      <p className="mt-1 text-text-tertiary">Revisa contenido publicado en la plataforma</p>

      {loading ? (
        <div data-testid="loading-skeleton" className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-5 animate-pulse">
              <div className="h-5 bg-surface-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-text-primary">Animales publicados recientes</h2>
            {animals.length === 0 ? (
              <p className="mt-4 text-text-quaternary">No hay animales publicados.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {animals.map((animal) => (
                  <div key={animal.id} className="rounded-xl border border-border-primary bg-surface-primary p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary">{animal.name}</p>
                      <p className="text-sm text-text-tertiary">
                        {animal.species === 'dog' ? 'Perro' : animal.species === 'cat' ? 'Gato' : 'Otro'} · {animal.shelter_name}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full self-start sm:self-auto ${shelterPillTeal}`}>{animal.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text-primary">Refugios registrados</h2>
            {shelters.length === 0 ? (
              <p className="mt-4 text-text-quaternary">No hay refugios registrados.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {shelters.map((shelter) => (
                  <div key={shelter.id} className="rounded-xl border border-border-primary bg-surface-primary p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary">{shelter.name}</p>
                      <p className="text-sm text-text-tertiary truncate">{shelter.city} · {shelter.owner_email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${shelterVerificationPillClass(shelter.verification_status)}`}>
                      {shelter.verification_status === 'verified' ? 'Verificado' :
                       shelter.verification_status === 'pending' ? 'Pendiente' : 'Rechazado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
