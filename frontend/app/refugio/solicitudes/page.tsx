'use client';

import { useEffect } from 'react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAdoptionStore } from '@/lib/stores/adoptionStore';

const statusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Enviada', color: 'bg-stone-100 text-stone-600' },
  reviewing: { label: 'En revisión', color: 'bg-amber-50 text-amber-700' },
  interview: { label: 'Entrevista', color: 'bg-teal-50 text-teal-700' },
  approved: { label: 'Aprobada', color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-50 text-red-700' },
};

export default function ShelterSolicitudesPage() {
  useRequireAuth();
  const applications = useAdoptionStore((s) => s.applications);
  const loading = useAdoptionStore((s) => s.loading);
  const fetchApplications = useAdoptionStore((s) => s.fetchApplications);
  const updateStatus = useAdoptionStore((s) => s.updateStatus);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (id: number, newStatus: 'reviewing' | 'interview' | 'approved' | 'rejected') => {
    try {
      await updateStatus(id, newStatus);
      void fetchApplications();
    } catch {
      // Handle error
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Solicitudes de Adopción</h1>
      <p className="mt-1 text-stone-500">Revisa y gestiona las solicitudes recibidas</p>

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-5 animate-pulse">
              <div className="h-5 bg-stone-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <p className="mt-8 text-stone-400">No hay solicitudes de adopción.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app) => {
            const st = statusLabels[app.status] ?? { label: app.status, color: 'bg-stone-100 text-stone-600' };
            return (
              <div key={app.id} className="rounded-xl border border-stone-200 bg-white p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-stone-800">{app.animal_name}</h3>
                    <p className="text-sm text-stone-500 mt-0.5">Solicitante: {app.user_email}</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Enviada: {new Date(app.created_at).toLocaleDateString('es')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    {app.status === 'submitted' && (
                      <button onClick={() => handleStatusChange(app.id, 'reviewing')}
                        className="text-xs px-3 py-1 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors">
                        Revisar
                      </button>
                    )}
                    {app.status === 'reviewing' && (
                      <>
                        <button onClick={() => handleStatusChange(app.id, 'interview')}
                          className="text-xs px-3 py-1 rounded-full border border-teal-300 text-teal-700 hover:bg-teal-50 transition-colors">
                          Entrevista
                        </button>
                        <button onClick={() => handleStatusChange(app.id, 'rejected')}
                          className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-50 transition-colors">
                          Rechazar
                        </button>
                      </>
                    )}
                    {app.status === 'interview' && (
                      <>
                        <button onClick={() => handleStatusChange(app.id, 'approved')}
                          className="text-xs px-3 py-1 rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors">
                          Aprobar
                        </button>
                        <button onClick={() => handleStatusChange(app.id, 'rejected')}
                          className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-50 transition-colors">
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {app.notes && (
                  <p className="mt-3 text-sm text-stone-600 bg-stone-50 rounded-lg p-3">{app.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
