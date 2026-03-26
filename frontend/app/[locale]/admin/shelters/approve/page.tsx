'use client';

import { useEffect, useState } from 'react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';

type PendingShelter = {
  id: number;
  name: string;
  legal_name: string;
  city: string;
  owner_email: string;
  created_at: string;
};

export default function AdminApproveSheltarsPage() {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [shelters, setShelters] = useState<PendingShelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadPending = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN_PENDING_SHELTERS);
      setShelters(res.data);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPending();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      await api.post(API_ENDPOINTS.ADMIN_APPROVE_SHELTER(id), { action });
      setShelters((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // Error
    } finally {
      setActionLoading(null);
    }
  };

  if (user && user.role !== 'admin' && !user.is_staff) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <p className="text-red-600 font-medium">Acceso denegado.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary">Aprobar Refugios</h1>
      <p className="mt-1 text-text-tertiary">Revisa y aprueba solicitudes de nuevos refugios</p>

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-5 animate-pulse">
              <div className="h-5 bg-surface-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : shelters.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border-primary bg-surface-primary p-8 text-center">
          <p className="text-text-quaternary">No hay refugios pendientes de aprobación</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {shelters.map((shelter) => (
            <div key={shelter.id} className="rounded-xl border border-border-primary bg-surface-primary p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-text-primary">{shelter.name}</h3>
                  {shelter.legal_name && (
                    <p className="text-sm text-text-tertiary">{shelter.legal_name}</p>
                  )}
                  <p className="text-sm text-text-tertiary mt-1">{shelter.city} · {shelter.owner_email}</p>
                  <p className="text-xs text-text-quaternary mt-1">
                    Registrado: {new Date(shelter.created_at).toLocaleDateString('es')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(shelter.id, 'approve')}
                    disabled={actionLoading === shelter.id}
                    className="text-sm px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleAction(shelter.id, 'reject')}
                    disabled={actionLoading === shelter.id}
                    className="text-sm px-4 py-2 rounded-full border border-red-300 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
