'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Shield, ChevronRight } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';

type DashboardMetrics = {
  total_users: number;
  total_shelters: number;
  verified_shelters: number;
  pending_shelters: number;
  total_animals: number;
  published_animals: number;
  adopted_animals: number;
  total_applications: number;
  active_campaigns: number;
  total_donations: number;
  total_sponsorships: number;
};

export default function AdminDashboardPage() {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.ADMIN_DASHBOARD);
        setMetrics(res.data);
      } catch {
        // Permission denied or error
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (user && user.role !== 'admin' && !user.is_staff) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <p className="text-red-600 font-medium">Acceso denegado. Solo administradores pueden acceder a este panel.</p>
      </div>
    );
  }

  const cards = metrics ? [
    { label: 'Usuarios', value: metrics.total_users, color: 'text-stone-800' },
    { label: 'Refugios', value: metrics.total_shelters, color: 'text-stone-800' },
    { label: 'Refugios verificados', value: metrics.verified_shelters, color: 'text-emerald-700' },
    { label: 'Pendientes de aprobación', value: metrics.pending_shelters, color: 'text-amber-700' },
    { label: 'Animales', value: metrics.total_animals, color: 'text-stone-800' },
    { label: 'Animales publicados', value: metrics.published_animals, color: 'text-teal-700' },
    { label: 'Adoptados', value: metrics.adopted_animals, color: 'text-emerald-700' },
    { label: 'Solicitudes', value: metrics.total_applications, color: 'text-stone-800' },
    { label: 'Campañas activas', value: metrics.active_campaigns, color: 'text-amber-700' },
    { label: 'Donaciones pagadas', value: metrics.total_donations, color: 'text-emerald-700' },
    { label: 'Apadrinamientos activos', value: metrics.total_sponsorships, color: 'text-teal-700' },
  ] : [];

  const navItems = [
    { label: 'Aprobar Refugios', href: ROUTES.ADMIN_APPROVE_SHELTERS, description: 'Revisa solicitudes de refugios pendientes' },
    { label: 'Moderación', href: ROUTES.ADMIN_MODERATION, description: 'Modera contenido y usuarios' },
    { label: 'Auditoría de Pagos', href: ROUTES.ADMIN_PAYMENTS, description: 'Revisa transacciones y pagos' },
    { label: 'Métricas', href: ROUTES.ADMIN_METRICS, description: 'Estadísticas detalladas de la plataforma' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <Shield className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Panel de Administración</h1>
          <p className="text-sm text-stone-500">Vista general de la plataforma Tu Huella</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-5">
              <div className="h-8 animate-shimmer rounded w-1/2" />
              <div className="h-4 animate-shimmer rounded w-2/3 mt-2" />
            </div>
          ))}
        </div>
      ) : metrics ? (
        <>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-sm text-stone-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-semibold text-stone-800">Acciones rápidas</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">{item.label}</h3>
                  <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm text-stone-500 mt-1">{item.description}</p>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-8 text-stone-400">No se pudieron cargar las métricas.</p>
      )}
    </div>
  );
}
