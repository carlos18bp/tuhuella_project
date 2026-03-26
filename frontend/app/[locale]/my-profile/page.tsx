'use client';

import { User, Mail, Shield, FileText, DollarSign, Heart, Star, Users, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES } from '@/lib/constants';

export default function MiPerfilPage() {
  const user = useAuthStore((s) => s.user);
  const t = useTranslations('profile');

  if (!user) {
    return (
      <div data-testid="loading-skeleton" className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="h-8 animate-shimmer rounded w-1/4 mb-8" />
        <div className="max-w-lg space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-4 h-16 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const activityLinks = [
    { label: t('applications'), desc: t('applicationsDesc'), href: ROUTES.MY_APPLICATIONS, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: t('donations'), desc: t('donationsDesc'), href: ROUTES.MY_DONATIONS, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
    { label: t('sponsorships'), desc: t('sponsorshipsDesc'), href: ROUTES.MY_SPONSORSHIPS, icon: Heart, color: 'text-rose-600 bg-rose-50' },
    { label: t('favorites'), desc: t('favoritesDesc'), href: ROUTES.FAVORITES, icon: Star, color: 'text-yellow-600 bg-yellow-50' },
    { label: t('intent'), desc: t('intentDesc'), href: ROUTES.MY_INTENT, icon: Users, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-lg font-bold">
          {user.first_name?.[0]?.toUpperCase() ?? <User className="h-6 w-6" />}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-tertiary">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-lg space-y-4">
        <div className="rounded-xl border border-border-primary border-l-4 border-l-teal-500 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-text-quaternary" />
            <p className="text-xs text-text-tertiary">{t('name')}</p>
          </div>
          <p className="text-sm font-medium text-text-secondary mt-1.5">{user.first_name} {user.last_name}</p>
        </div>
        <div className="rounded-xl border border-border-primary border-l-4 border-l-teal-500 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-text-quaternary" />
            <p className="text-xs text-text-tertiary">{t('email')}</p>
          </div>
          <p className="text-sm font-medium text-text-secondary mt-1.5">{user.email}</p>
        </div>
        <div className="rounded-xl border border-border-primary border-l-4 border-l-teal-500 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-text-quaternary" />
            <p className="text-xs text-text-tertiary">{t('role')}</p>
          </div>
          <p className="text-sm font-medium text-text-secondary mt-1.5 capitalize">{user.role.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Activity Dashboard */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-text-primary mb-4">{t('myActivity')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activityLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-border-primary p-5 shadow-sm hover:shadow-md hover:border-border-secondary transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-300 group-hover:text-text-tertiary transition-colors" />
                </div>
                <h3 className="mt-3 font-semibold text-text-primary">{item.label}</h3>
                <p className="text-xs text-text-tertiary mt-1">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
