'use client';

import { useEffect } from 'react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAdoptionStore } from '@/lib/stores/adoptionStore';
import {
  shelterPillAmber,
  shelterPillEmerald,
  shelterPillNeutralSecondary,
  shelterPillRed,
  shelterPillTeal,
} from '@/lib/ui/shelterPanelBadges';

const statusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Enviada', color: shelterPillNeutralSecondary },
  reviewing: { label: 'En revisión', color: shelterPillAmber },
  interview: { label: 'Entrevista', color: shelterPillTeal },
  approved: { label: 'Aprobada', color: shelterPillEmerald },
  rejected: { label: 'Rechazada', color: shelterPillRed },
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
    <div className="mx-auto max-w-[1400px] px-6 py-10 min-w-0 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Solicitudes de Adopción</h1>
      <p className="mt-1 text-text-tertiary">Revisa y gestiona las solicitudes recibidas</p>

      {loading ? (
        <div data-testid="loading-skeleton" className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-5 animate-pulse">
              <div className="h-5 bg-surface-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <p className="mt-8 text-text-quaternary">No hay solicitudes de adopción.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app) => {
            const st = statusLabels[app.status] ?? { label: app.status, color: 'bg-surface-tertiary text-text-secondary' };
            return (
              <div key={app.id} role="article" className="rounded-xl border border-border-primary bg-surface-primary p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-text-primary">{app.animal_name}</h3>
                    <p className="text-sm text-text-tertiary mt-0.5">Solicitante: {app.user_email}</p>
                    <p className="text-xs text-text-quaternary mt-1">
                      Enviada: {new Date(app.created_at).toLocaleDateString('es')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    {app.status === 'submitted' && (
                      <button
                        onClick={() => handleStatusChange(app.id, 'reviewing')}
                        className="inline-flex items-center justify-center min-h-11 sm:min-h-9 text-xs px-3 py-1 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600/50 dark:text-amber-300 dark:hover:bg-amber-950/35 transition-colors"
                      >
                        Revisar
                      </button>
                    )}
                    {app.status === 'reviewing' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, 'interview')}
                          className="inline-flex items-center justify-center min-h-11 sm:min-h-9 text-xs px-3 py-1 rounded-full border border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-600/50 dark:text-teal-300 dark:hover:bg-teal-950/35 transition-colors"
                        >
                          Entrevista
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          className="inline-flex items-center justify-center min-h-11 sm:min-h-9 text-xs px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700/50 dark:text-red-300 dark:hover:bg-red-950/35 transition-colors"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {app.status === 'interview' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, 'approved')}
                          className="inline-flex items-center justify-center min-h-11 sm:min-h-9 text-xs px-3 py-1 rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600/50 dark:text-emerald-300 dark:hover:bg-emerald-950/35 transition-colors"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          className="inline-flex items-center justify-center min-h-11 sm:min-h-9 text-xs px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700/50 dark:text-red-300 dark:hover:bg-red-950/35 transition-colors"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {app.notes && (
                  <p className="mt-3 text-sm text-text-secondary bg-surface-secondary rounded-lg p-3">{app.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
