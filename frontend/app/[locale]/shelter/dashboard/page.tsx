'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, MapPin, ChevronRight, PawPrint, FileText, DollarSign, Clock, Users, Megaphone } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import type { Shelter } from '@/lib/types';

type ShelterMetrics = {
  total_animals: number;
  published_animals: number;
  adopted_animals: number;
  total_applications: number;
  avg_applications_per_animal: number;
  donations: { total_amount: string; total_count: number; avg_amount: string };
  sponsorships: { total_amount: string; total_count: number };
  avg_adoption_time_days: number | null;
  update_posts_count: number;
  active_campaigns: number;
};

export default function ShelterDashboardPage() {
  useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const t = useTranslations('metrics');
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [metrics, setMetrics] = useState<ShelterMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.SHELTERS, { params: { owner: 'me' } });
        const shelters = res.data;
        if (shelters.length > 0) setShelter(shelters[0]);
        // Load metrics in parallel
        try {
          const metricsRes = await api.get(API_ENDPOINTS.SHELTER_METRICS);
          setMetrics(metricsRes.data);
        } catch {
          // metrics may fail if not shelter_admin role
        }
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
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-primary p-6 h-24 animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10 text-center py-20">
        <h1 className="text-2xl font-bold text-text-primary">No tienes un refugio registrado</h1>
        <p className="mt-2 text-text-tertiary">Registra tu refugio para comenzar a gestionar animales.</p>
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
    { label: 'Actualizaciones', href: ROUTES.SHELTER_UPDATES, description: 'Publica evidencias y novedades' },
    { label: 'Configuración', href: ROUTES.SHELTER_SETTINGS, description: 'Actualiza la información de tu refugio' },
  ];

  const metricCards = metrics ? [
    { label: t('totalAnimals'), value: metrics.total_animals, icon: PawPrint, color: 'border-teal-200 bg-teal-50/50', iconColor: 'text-teal-600' },
    { label: t('adoptedAnimals'), value: metrics.adopted_animals, icon: PawPrint, color: 'border-emerald-200 bg-emerald-50/50', iconColor: 'text-emerald-600' },
    { label: t('totalApplications'), value: metrics.total_applications, icon: Users, color: 'border-blue-200 bg-blue-50/50', iconColor: 'text-blue-600' },
    { label: t('avgAppsPerAnimal'), value: metrics.avg_applications_per_animal, icon: Users, color: 'border-indigo-200 bg-indigo-50/50', iconColor: 'text-indigo-600' },
    { label: t('totalDonations'), value: `$${Number(metrics.donations.total_amount).toLocaleString()}`, icon: DollarSign, color: 'border-amber-200 bg-amber-50/50', iconColor: 'text-amber-600' },
    { label: t('avgDonation'), value: `$${Number(metrics.donations.avg_amount).toLocaleString()}`, icon: DollarSign, color: 'border-orange-200 bg-orange-50/50', iconColor: 'text-orange-600' },
    { label: t('avgAdoptionDays'), value: metrics.avg_adoption_time_days != null ? `${metrics.avg_adoption_time_days}d` : '—', icon: Clock, color: 'border-purple-200 bg-purple-50/50', iconColor: 'text-purple-600' },
    { label: t('updatePosts'), value: metrics.update_posts_count, icon: FileText, color: 'border-cyan-200 bg-cyan-50/50', iconColor: 'text-cyan-600' },
    { label: t('activeCampaigns'), value: metrics.active_campaigns, icon: Megaphone, color: 'border-rose-200 bg-rose-50/50', iconColor: 'text-rose-600' },
  ] : [];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{shelter.name}</h1>
            <div className="flex items-center gap-1 mt-0.5 text-sm text-text-tertiary">
              <MapPin className="h-3.5 w-3.5 text-text-quaternary" />
              {shelter.city}
            </div>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${verificationColor}`}>
          {verificationLabel}
        </span>
      </div>

      {/* Metrics section */}
      {metrics && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-4">{t('shelterOverview')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`rounded-2xl border p-4 ${card.color}`}>
                  <Icon className={`h-4 w-4 ${card.iconColor} mb-2`} />
                  <p className="text-xl font-bold text-text-primary">{card.value}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{card.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className="rounded-2xl border border-border-primary bg-surface-primary p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary group-hover:text-teal-700 transition-colors">{item.label}</h3>
              <ChevronRight className="h-4 w-4 text-text-quaternary group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-sm text-text-tertiary mt-1">{item.description}</p>
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
