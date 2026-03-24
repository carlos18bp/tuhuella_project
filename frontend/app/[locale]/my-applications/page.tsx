'use client';

import { useEffect } from 'react';
import { ClipboardList } from 'lucide-react';

import { useAdoptionStore } from '@/lib/stores/adoptionStore';

const statusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Enviada', color: 'bg-stone-100 text-stone-600' },
  reviewing: { label: 'En revisión', color: 'bg-amber-50 text-amber-700' },
  interview: { label: 'Entrevista', color: 'bg-teal-50 text-teal-700' },
  approved: { label: 'Aprobada', color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-50 text-red-700' },
};

export default function MisSolicitudesPage() {
  const applications = useAdoptionStore((s) => s.applications);
  const loading = useAdoptionStore((s) => s.loading);
  const fetchApplications = useAdoptionStore((s) => s.fetchApplications);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Mis Solicitudes de Adopción</h1>
          <p className="text-sm text-stone-500">Seguimiento de tus solicitudes</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-5">
              <div className="h-5 animate-shimmer rounded w-1/3" />
              <div className="h-3 animate-shimmer rounded w-1/4 mt-2" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-10 text-center py-12">
          <ClipboardList className="h-12 w-12 text-stone-300 mx-auto" />
          <p className="mt-3 text-stone-400">No tienes solicitudes de adopción.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app) => {
            const st = statusLabels[app.status] ?? { label: app.status, color: 'bg-stone-100 text-stone-600' };
            return (
              <div key={app.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-800">{app.animal_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                {app.shelter_name && <p className="text-sm text-stone-500 mt-1">{app.shelter_name}</p>}
                <p className="text-xs text-stone-400 mt-2">Enviada: {new Date(app.created_at).toLocaleDateString('es')}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
