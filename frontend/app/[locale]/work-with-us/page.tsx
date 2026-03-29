'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Camera, Heart, Truck, Stethoscope, Share2,
  CalendarCheck, Home, HandCoins, ArrowRight,
  GraduationCap, Palette, Languages, Dog,
} from 'lucide-react';

import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import type { VolunteerPosition, StrategicAlly } from '@/lib/types';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  photographer: Camera,
  shelter_helper: Heart,
  driver: Truck,
  veterinary_volunteer: Stethoscope,
  social_media: Share2,
  event_coordinator: CalendarCheck,
  foster_home: Home,
  fundraiser: HandCoins,
  educator: GraduationCap,
  designer: Palette,
  translator: Languages,
  dog_walker: Dog,
};

export default function WorkWithUsPage() {
  const locale = useLocale();
  const t = useTranslations('workWithUs');

  const [positions, setPositions] = useState<VolunteerPosition[]>([]);
  const [allies, setAllies] = useState<StrategicAlly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [posRes, allyRes] = await Promise.all([
          api.get(API_ENDPOINTS.VOLUNTEER_POSITIONS, { params: { lang: locale } }),
          api.get(API_ENDPOINTS.STRATEGIC_ALLIES, { params: { lang: locale } }),
        ]);
        setPositions(posRes.data);
        setAllies(allyRes.data.slice(0, 3));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [locale]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary heading-decorated">{t('title')}</h1>
      <p className="mt-2 text-text-tertiary max-w-2xl">{t('subtitle')}</p>

      {/* Volunteer Positions */}
      <div className="mt-8 md:mt-12">
        <h2 className="text-xl font-semibold text-text-primary">{t('positionsTitle')}</h2>
        <p className="text-sm text-text-tertiary mt-1">{t('positionsSubtitle')}</p>

        {loading ? (
          <div role="status" aria-label="loading" className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-primary p-6 h-48 animate-shimmer" />
            ))}
          </div>
        ) : positions.length === 0 ? (
          <p className="mt-6 text-text-tertiary">{t('noPositions')}</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {positions.map((pos) => {
              const Icon = categoryIcons[pos.category] || Heart;
              return (
                <div key={pos.id} className="rounded-2xl border border-border-primary bg-surface-primary p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-semibold text-text-primary">{pos.title}</h3>
                  <p className="mt-2 text-sm text-text-tertiary line-clamp-3">{pos.description}</p>
                  {pos.requirements && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-text-secondary">{t('requirements')}:</p>
                      <p className="text-xs text-text-quaternary mt-0.5 line-clamp-2">{pos.requirements}</p>
                    </div>
                  )}
                  <Link
                    href={ROUTES.VOLUNTEER_APPLY(pos.id)}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    {t('apply')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Strategic Allies Teaser */}
      {allies.length > 0 && (
        <div className="mt-10 md:mt-16 border-t border-border-primary pt-8 md:pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('alliesTitle')}</h2>
              <p className="text-sm text-text-tertiary mt-1">{t('alliesSubtitle')}</p>
            </div>
            <Link
              href={ROUTES.STRATEGIC_ALLIES}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors"
            >
              {t('viewAllAllies')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allies.map((ally) => (
              <div key={ally.id} className="rounded-2xl border border-border-primary bg-surface-primary p-5 shadow-sm flex items-center gap-4">
                {ally.logo_url ? (
                  <img src={ally.logo_url} alt={ally.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-text-quaternary">{ally.name[0]}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">{ally.name}</h3>
                  {ally.description && (
                    <p className="text-xs text-text-tertiary line-clamp-1">{ally.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
