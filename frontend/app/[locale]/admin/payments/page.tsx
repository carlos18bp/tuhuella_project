'use client';

import { useEffect, useState } from 'react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import type { Payment } from '@/lib/types';

export default function AdminPagosPage() {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/payments/');
        setPayments(res.data);
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

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700' },
    approved: { label: 'Aprobado', color: 'bg-emerald-50 text-emerald-700' },
    declined: { label: 'Rechazado', color: 'bg-red-50 text-red-700' },
    voided: { label: 'Anulado', color: 'bg-surface-tertiary text-text-secondary' },
    error: { label: 'Error', color: 'bg-red-50 text-red-700' },
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Auditoría de Pagos</h1>
      <p className="mt-1 text-text-tertiary">Historial de transacciones en la plataforma</p>

      {loading ? (
        <div data-testid="loading-skeleton" className="mt-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-5 animate-pulse">
              <div className="h-5 bg-surface-tertiary rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <p className="mt-8 text-text-quaternary">No hay transacciones registradas.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-tertiary border-b border-border-primary">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Proveedor</th>
                <th className="pb-3 pr-4">Referencia</th>
                <th className="pb-3 pr-4">Monto</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3 pr-4">Tipo</th>
                <th className="pb-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-tertiary">
              {payments.map((payment) => {
                const st = statusLabels[payment.status] ?? { label: payment.status, color: 'bg-surface-tertiary text-text-secondary' };
                const type = payment.donation ? 'Donación' : payment.sponsorship ? 'Apadrinamiento' : '—';
                return (
                  <tr key={payment.id} className="text-text-secondary">
                    <td className="py-3 pr-4 font-mono text-xs">{payment.id}</td>
                    <td className="py-3 pr-4 capitalize">{payment.provider}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{payment.provider_reference || '—'}</td>
                    <td className="py-3 pr-4 font-semibold">${Number(payment.amount).toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs">{type}</td>
                    <td className="py-3 text-xs text-text-quaternary">
                      {new Date(payment.created_at).toLocaleDateString('es')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
