'use client';

import { useEffect, useState } from 'react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';

type MetricsData = {
  donations: { total_amount: string; total_count: number };
  sponsorships: { total_amount: string; total_count: number };
  adoption_rate: { total_published: number; total_adopted: number };
};

export default function AdminMetricasPage() {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.ADMIN_METRICS);
        setMetrics(res.data);
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

  const adoptionRate = metrics?.adoption_rate
    ? metrics.adoption_rate.total_published > 0
      ? Math.round((metrics.adoption_rate.total_adopted / metrics.adoption_rate.total_published) * 100)
      : 0
    : 0;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Métricas</h1>
      <p className="mt-1 text-stone-500">Estadísticas detalladas de la plataforma</p>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 p-6 animate-pulse">
              <div className="h-10 bg-stone-100 rounded w-1/2" />
              <div className="h-4 bg-stone-100 rounded w-2/3 mt-3" />
            </div>
          ))}
        </div>
      ) : metrics ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-3xl font-bold text-amber-700">
              ${Number(metrics.donations.total_amount).toLocaleString()}
            </p>
            <p className="text-sm text-amber-600 mt-1">Total donaciones recaudadas</p>
            <p className="text-xs text-amber-500 mt-2">{metrics.donations.total_count} donaciones pagadas</p>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
            <p className="text-3xl font-bold text-teal-700">
              ${Number(metrics.sponsorships.total_amount).toLocaleString()}
            </p>
            <p className="text-sm text-teal-600 mt-1">Total apadrinamientos activos</p>
            <p className="text-xs text-teal-500 mt-2">{metrics.sponsorships.total_count} apadrinamientos</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-3xl font-bold text-emerald-700">{adoptionRate}%</p>
            <p className="text-sm text-emerald-600 mt-1">Tasa de adopción</p>
            <p className="text-xs text-emerald-500 mt-2">
              {metrics.adoption_rate.total_adopted} adoptados de {metrics.adoption_rate.total_published} publicados
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-3xl font-bold text-stone-800">{metrics.adoption_rate.total_published}</p>
            <p className="text-sm text-stone-500 mt-1">Animales publicados</p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-3xl font-bold text-emerald-700">{metrics.adoption_rate.total_adopted}</p>
            <p className="text-sm text-stone-500 mt-1">Animales adoptados</p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-3xl font-bold text-amber-700">
              ${(Number(metrics.donations.total_amount) + Number(metrics.sponsorships.total_amount)).toLocaleString()}
            </p>
            <p className="text-sm text-stone-500 mt-1">Impacto financiero total</p>
          </div>
        </div>
      ) : (
        <p className="mt-8 text-stone-400">No se pudieron cargar las métricas.</p>
      )}
    </div>
  );
}
