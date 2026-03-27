'use client';

import { User, Mail, Shield, MapPin, Phone, FileText, DollarSign, Heart, Star, Users, ChevronRight, Calendar } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES } from '@/lib/constants';

export default function MiPerfilPage() {
  const user = useAuthStore((s) => s.user);
  const t = useTranslations('profile');

  if (!user) {
    return (
      <div data-testid="loading-skeleton" className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-border-primary p-8 h-64 animate-shimmer" />
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border-primary p-5 h-20 animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const initials = [user.first_name?.[0], user.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  const activityLinks = [
    { label: t('applications'), desc: t('applicationsDesc'), href: ROUTES.MY_APPLICATIONS, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: t('donations'), desc: t('donationsDesc'), href: ROUTES.MY_DONATIONS, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
    { label: t('sponsorships'), desc: t('sponsorshipsDesc'), href: ROUTES.MY_SPONSORSHIPS, icon: Heart, color: 'text-rose-600 bg-rose-50' },
    { label: t('favorites'), desc: t('favoritesDesc'), href: ROUTES.FAVORITES, icon: Star, color: 'text-yellow-600 bg-yellow-50' },
    { label: t('intent'), desc: t('intentDesc'), href: ROUTES.MY_INTENT, icon: Users, color: 'text-teal-600 bg-teal-50' },
  ];

  const profileFields = [
    { icon: Mail, label: t('email'), value: user.email },
    { icon: Shield, label: t('role'), value: user.role.replace('_', ' ') },
    ...(user.phone ? [{ icon: Phone, label: 'Teléfono', value: user.phone }] : []),
    ...(user.city ? [{ icon: MapPin, label: 'Ciudad', value: user.city }] : []),
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — Profile card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden">
            {/* Header gradient */}
            <div className="h-24 bg-gradient-to-br from-teal-500 to-teal-600 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="h-20 w-20 rounded-full bg-surface-primary border-4 border-surface-primary shadow-md flex items-center justify-center">
                  {initials ? (
                    <span className="text-2xl font-bold text-teal-700">{initials}</span>
                  ) : (
                    <User className="h-8 w-8 text-text-quaternary" />
                  )}
                </div>
              </div>
            </div>

            {/* Name + role */}
            <div className="pt-14 pb-2 px-6 text-center">
              <h1 className="text-xl font-bold text-text-primary">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-sm text-text-tertiary capitalize mt-0.5">{user.role.replace('_', ' ')}</p>
            </div>

            {/* Info fields */}
            <div className="px-6 pb-6 pt-4 space-y-3">
              {profileFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-surface-secondary">
                    <Icon className="h-4 w-4 text-text-quaternary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-text-quaternary uppercase tracking-wider">{field.label}</p>
                      <p className="text-sm font-medium text-text-secondary truncate capitalize">{field.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column — Activity dashboard */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-text-primary mb-4">{t('myActivity')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activityLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm hover:shadow-md hover:border-border-secondary transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-quaternary group-hover:text-text-tertiary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="mt-3 font-semibold text-text-primary">{item.label}</h3>
                  <p className="text-xs text-text-tertiary mt-1 leading-relaxed">{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
