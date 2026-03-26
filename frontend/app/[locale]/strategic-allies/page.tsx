'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';

import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { StrategicAlly } from '@/lib/types';

export default function StrategicAlliesPage() {
  const locale = useLocale();
  const t = useTranslations('strategicAllies');

  const [allies, setAllies] = useState<StrategicAlly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API_ENDPOINTS.STRATEGIC_ALLIES, { params: { lang: locale } })
      .then((res) => setAllies(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary heading-decorated">{t('title')}</h1>
      <p className="mt-2 text-text-tertiary max-w-2xl">{t('subtitle')}</p>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border-primary p-6 h-40 animate-shimmer" />
          ))}
        </div>
      ) : allies.length === 0 ? (
        <p className="mt-10 text-text-tertiary">{t('noAllies')}</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allies.map((ally) => (
            <div key={ally.id} className="rounded-2xl border border-border-primary bg-surface-primary p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                {ally.logo_url ? (
                  <img src={ally.logo_url} alt={ally.name} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-teal-600">{ally.name[0]}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">{ally.name}</h3>
                  <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full bg-surface-tertiary text-text-tertiary capitalize">
                    {t(`types.${ally.ally_type}`)}
                  </span>
                </div>
              </div>
              {ally.description && (
                <p className="text-sm text-text-secondary line-clamp-3">{ally.description}</p>
              )}
              {ally.website && (
                <a
                  href={ally.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  {t('visitWebsite')}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
