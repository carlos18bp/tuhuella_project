'use client';

import { useEffect, useState } from 'react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Animal, Shelter } from '@/lib/types';

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
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <p className="text-red-600 font-medium">Acceso denegado.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary">Moderación</h1>
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
                  <div key={animal.id} className="rounded-xl border border-border-primary bg-surface-primary p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">{animal.name}</p>
                      <p className="text-sm text-text-tertiary">
                        {animal.species === 'dog' ? 'Perro' : animal.species === 'cat' ? 'Gato' : 'Otro'} · {animal.shelter_name}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">{animal.status}</span>
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
                  <div key={shelter.id} className="rounded-xl border border-border-primary bg-surface-primary p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">{shelter.name}</p>
                      <p className="text-sm text-text-tertiary">{shelter.city} · {shelter.owner_email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      shelter.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-700' :
                      shelter.verification_status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
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
