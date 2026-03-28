'use client';

import { useEffect } from 'react';
import {
  User as UserIcon, Mail, Shield, MapPin, Phone, FileText, DollarSign,
  Heart, Users, ChevronRight, Calendar, Pencil,
  Clock, HandHeart, MailOpen,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES } from '@/lib/constants';
import type { ProfileStats, ActivityEvent } from '@/lib/types';

// ---------------------------------------------------------------------------
// Profile completeness — frontend-only calculation
// ---------------------------------------------------------------------------

function calcCompleteness(user: NonNullable<ReturnType<typeof useAuthStore>['user']>, hasIntent: boolean) {
  let score = 0;
  if (user.first_name && user.last_name) score += 15;
  if (user.email) score += 15;
  if (user.phone) score += 20;
  if (user.city) score += 20;
  if (hasIntent) score += 30;
  return score;
}

// ---------------------------------------------------------------------------
// Activity Timeline
// ---------------------------------------------------------------------------

function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  const t = useTranslations('profile');

  if (events.length === 0) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-teal-50/50 to-surface-secondary dark:from-teal-900/10 dark:to-surface-secondary p-6 text-center">
        <div className="h-12 w-12 rounded-xl bg-teal-100/60 dark:bg-teal-900/30 flex items-center justify-center mx-auto">
          <Clock className="h-6 w-6 text-teal-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-text-secondary">{t('noActivity')}</p>
        <p className="mt-1 text-xs text-text-quaternary leading-relaxed max-w-xs mx-auto">{t('noActivityDesc')}</p>
        <Link href={ROUTES.ANIMALS} className="mt-4 inline-block text-xs bg-teal-600 text-white rounded-full px-5 py-2 font-medium hover:bg-teal-700 transition-colors shadow-sm">
          {t('exploreToStart')} &rarr;
        </Link>
      </div>
    );
  }

  const iconMap: Record<string, { icon: typeof FileText; color: string }> = {
    application: { icon: FileText, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30' },
    donation: { icon: DollarSign, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
    sponsorship: { icon: HandHeart, color: 'text-red-500 bg-red-50 dark:bg-red-900/30' },
    favorite: { icon: Heart, color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/30' },
  };

  function getDescription(event: ActivityEvent) {
    switch (event.type) {
      case 'application':
        return t('activityApplication', { name: event.animal_name || '' });
      case 'donation':
        return t('activityDonation', { amount: event.amount || '0', shelter: event.shelter_name || '' });
      case 'sponsorship':
        return t('activitySponsorship', { name: event.animal_name || '' });
      case 'favorite':
        return t('activityFavorite', { name: event.animal_name || '' });
      default:
        return '';
    }
  }

  function relativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t('today');
    if (days === 1) return t('yesterday');
    if (days < 30) return t('daysAgo', { days });
    const months = Math.floor(days / 30);
    return t('monthsAgo', { months });
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const { icon: Icon, color } = iconMap[event.type] || iconMap.favorite;
        return (
          <div key={i} className="flex gap-3 relative">
            {/* Timeline line */}
            {i < events.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border-primary" />
            )}
            {/* Icon */}
            <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            {/* Content */}
            <div className="flex-1 pb-5">
              <p className="text-sm text-text-secondary">{getDescription(event)}</p>
              <p className="text-xs text-text-quaternary mt-0.5">{relativeTime(event.date)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MiPerfilPage() {
  const user = useAuthStore((s) => s.user);
  const profileStats = useAuthStore((s) => s.profileStats);
  const activity = useAuthStore((s) => s.activity);
  const fetchProfileStats = useAuthStore((s) => s.fetchProfileStats);
  const fetchActivity = useAuthStore((s) => s.fetchActivity);
  const t = useTranslations('profile');


  useEffect(() => {
    void fetchProfileStats();
    void fetchActivity();
  }, [fetchProfileStats, fetchActivity]);

  if (!user) {
    return (
      <div data-testid="loading-skeleton" className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-border-primary p-8 h-72 animate-shimmer" />
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border-primary p-5 h-24 animate-shimmer" />
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

  const completeness = calcCompleteness(user, !!profileStats?.adopter_intent);
  const completenessColor =
    completeness < 50 ? 'bg-red-500' : completeness < 80 ? 'bg-amber-500' : 'bg-emerald-500';
  const completenessTextColor =
    completeness < 50 ? 'text-red-600' : completeness < 80 ? 'text-amber-600' : 'text-emerald-600';

  const memberSince = user.date_joined
    ? new Date(user.date_joined).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    : '';

  const stats = profileStats;

  const activityLinks = [
    {
      label: t('applications'),
      desc: stats ? t('applicationsCount', { total: stats.applications.total, approved: stats.applications.by_status.approved || 0 }) : t('applicationsDesc'),
      href: ROUTES.MY_APPLICATIONS,
      icon: FileText,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
      badge: stats?.applications.total ?? null,
    },
    {
      label: t('donations'),
      desc: stats ? t('donationsCount', { amount: stats.donations.total_amount, count: stats.donations.count }) : t('donationsDesc'),
      href: ROUTES.MY_DONATIONS,
      icon: DollarSign,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
      badge: stats?.donations.count ?? null,
    },
    {
      label: t('sponsorships'),
      desc: stats ? t('sponsorshipsCount', { active: stats.sponsorships.active_count }) : t('sponsorshipsDesc'),
      href: ROUTES.MY_SPONSORSHIPS,
      icon: HandHeart,
      color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
      badge: stats?.sponsorships.active_count ?? null,
    },
    {
      label: t('favorites'),
      desc: stats ? t('favoritesCount', { count: stats.favorites.count }) : t('favoritesDesc'),
      href: ROUTES.FAVORITES,
      icon: Heart,
      color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
      badge: stats?.favorites.count ?? null,
      preview: stats?.favorites.preview,
    },
    {
      label: t('intent'),
      desc: stats?.adopter_intent ? t('intentStatus', { status: stats.adopter_intent.status }) : t('intentCreate'),
      href: ROUTES.MY_INTENT,
      icon: Users,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
      intentStatus: stats?.adopter_intent?.status,
    },
  ];

  const profileFields = [
    { icon: Mail, label: t('email'), value: user.email },
    { icon: Shield, label: t('role'), value: user.role.replace('_', ' ') },
    ...(user.phone ? [{ icon: Phone, label: t('phone'), value: user.phone }] : []),
    ...(user.city ? [{ icon: MapPin, label: t('city'), value: user.city }] : []),
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      {/* Shelter invite banner */}
      {stats && stats.shelter_invites.pending_count > 0 && (
        <div className="mb-6 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
          <MailOpen className="h-5 w-5 text-teal-600 shrink-0" />
          <p className="text-sm text-teal-700 dark:text-teal-300 flex-1">
            {t('shelterInvites', { count: stats.shelter_invites.pending_count })}
          </p>
          <Link href={ROUTES.MY_INTENT} className="text-sm font-medium text-teal-700 dark:text-teal-300 hover:underline shrink-0">
            {t('viewInvites')} &rarr;
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — Profile card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm overflow-hidden relative">
            {/* Edit button */}
            <Link
              href={ROUTES.MY_PROFILE_EDIT}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-surface-elevated/80 backdrop-blur-sm shadow-sm ring-1 ring-border-primary flex items-center justify-center text-text-tertiary hover:text-teal-600 transition-colors"
              aria-label={t('editProfile')}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>

            {/* Header gradient */}
            <div className="h-24 bg-gradient-to-br from-teal-500 to-teal-600 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="h-20 w-20 rounded-full bg-surface-primary border-4 border-surface-primary shadow-md flex items-center justify-center">
                  {initials ? (
                    <span className="text-2xl font-bold text-teal-700">{initials}</span>
                  ) : (
                    <UserIcon className="h-8 w-8 text-text-quaternary" />
                  )}
                </div>
              </div>
            </div>

            {/* Name + role + member since */}
            <div className="pt-14 pb-2 px-6 text-center">
              <h1 className="text-xl font-bold text-text-primary">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-sm text-text-tertiary capitalize mt-0.5">{user.role.replace('_', ' ')}</p>
              {memberSince && (
                <p className="text-xs text-text-quaternary mt-1 flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t('memberSince', { date: memberSince })}
                </p>
              )}
            </div>

            {/* Completeness bar */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={`font-medium ${completenessTextColor}`}>
                  {completeness < 100 ? t('completeProfile') : t('profileComplete')}
                </span>
                <span className="text-text-quaternary">{completeness}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-tertiary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${completenessColor}`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              {completeness < 100 && (
                <Link
                  href={ROUTES.MY_PROFILE_EDIT}
                  className="mt-2 inline-block text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  {t('completeNow')} &rarr;
                </Link>
              )}
            </div>

            {/* Info fields */}
            <div className="px-6 pb-6 space-y-2">
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

          {/* Activity timeline */}
          <div className="rounded-2xl border border-border-primary bg-surface-primary shadow-sm p-5">
            <h2 className="text-base font-bold text-text-primary mb-4">{t('recentActivity')}</h2>
            <ActivityTimeline events={activity} />
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
                    <div className="flex items-center gap-2">
                      {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                        <span className="text-xs font-bold text-text-primary bg-surface-tertiary rounded-full h-6 min-w-[24px] flex items-center justify-center px-2">
                          {item.badge}
                        </span>
                      )}
                      {/* Intent status badge */}
                      {'intentStatus' in item && item.intentStatus && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.intentStatus === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          item.intentStatus === 'paused' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                          'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                        }`}>
                          {item.intentStatus}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-text-quaternary group-hover:text-text-tertiary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-semibold text-text-primary">{item.label}</h3>
                  <p className="text-xs text-text-tertiary mt-1 leading-relaxed">{item.desc}</p>

                  {/* Favorites preview thumbnails */}
                  {'preview' in item && item.preview && item.preview.length > 0 && (
                    <div className="flex items-center gap-1 mt-3">
                      {item.preview.map((p) => (
                        <div
                          key={p.id}
                          className="h-8 w-8 rounded-full bg-surface-tertiary border-2 border-surface-primary overflow-hidden flex items-center justify-center -ml-1 first:ml-0"
                          title={p.name}
                        >
                          {p.thumbnail_url ? (
                            <img src={p.thumbnail_url} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-text-quaternary">
                              {p.name[0]}
                            </span>
                          )}
                        </div>
                      ))}
                      {stats && stats.favorites.count > 4 && (
                        <span className="text-[10px] text-text-quaternary ml-1">
                          +{stats.favorites.count - 4}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
