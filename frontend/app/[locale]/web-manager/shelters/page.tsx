'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';

import { useWebManagerStore } from '@/lib/stores/webManagerStore';
import { ROUTES } from '@/lib/constants';

const FILTERS = [
  { key: '', labelKey: 'filterAll' as const },
  { key: 'pending', labelKey: 'shelters.pending' as const },
  { key: 'verified', labelKey: 'shelters.verified' as const },
  { key: 'rejected', labelKey: 'shelters.rejected' as const },
];

export default function WebManagerSheltersPage() {
  const t = useTranslations('webManager');
  const shelters = useWebManagerStore((s) => s.shelters);
  const meta = useWebManagerStore((s) => s.sheltersMeta);
  const loading = useWebManagerStore((s) => s.sheltersLoading);
  const fetchShelters = useWebManagerStore((s) => s.fetchShelters);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    void fetchShelters({ verification_status: filter || undefined, page: 1, page_size: 25 });
  }, [fetchShelters, filter]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">{t('sheltersTitle')}</h1>
        <p className="text-sm text-text-tertiary mt-1">{t('sheltersSubtitle')}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-full ring-1 transition-colors ${
              filter === f.key
                ? 'bg-teal-600 text-white ring-teal-600'
                : 'bg-surface-primary text-text-secondary ring-border-primary hover:bg-surface-hover'
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {meta && (
        <p className="text-xs text-text-quaternary">{t('resultsCount', { count: meta.count })}</p>
      )}

      {loading ? (
        <div role="status" aria-label="loading" className="py-10 text-center text-text-tertiary">
          {t('loading')}
        </div>
      ) : shelters.length === 0 ? (
        <p className="py-8 text-center text-text-tertiary">{t('noShelters')}</p>
      ) : (
        <ul className="space-y-3">
          {shelters.map((shelter) => (
            <li key={shelter.id}>
              <Link
                href={ROUTES.WEB_MANAGER_SHELTER_DETAIL(shelter.id)}
                className="flex items-center justify-between rounded-2xl border border-border-primary bg-surface-primary p-4 hover:bg-surface-hover transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">{shelter.name}</p>
                  <p className="text-xs text-text-tertiary">
                    {shelter.city}
                    {' · '}
                    {t(`shelters.${shelter.verification_status}` as unknown as 'shelters.verified')}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-text-quaternary shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
