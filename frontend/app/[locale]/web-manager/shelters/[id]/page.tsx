'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';

import { useWebManagerStore } from '@/lib/stores/webManagerStore';
import AdminApplicationsTable from '@/components/web-manager/AdminApplicationsTable';
import { ROUTES } from '@/lib/constants';

type TabKey = 'info' | 'applications';

export default function WebManagerShelterDetailPage() {
  const t = useTranslations('webManager');
  const params = useParams();
  const shelterId = Number(params.id);

  const shelters = useWebManagerStore((s) => s.shelters);
  const fetchShelters = useWebManagerStore((s) => s.fetchShelters);
  const applications = useWebManagerStore((s) => s.applications);
  const loadingApps = useWebManagerStore((s) => s.applicationsLoading);
  const fetchShelterApplications = useWebManagerStore((s) => s.fetchShelterApplications);

  const [tab, setTab] = useState<TabKey>('applications');

  useEffect(() => {
    if (shelters.length === 0) void fetchShelters({ page_size: 100 });
  }, [fetchShelters, shelters.length]);

  useEffect(() => {
    if (shelterId && tab === 'applications') {
      void fetchShelterApplications(shelterId, { page: 1, page_size: 50 });
    }
  }, [shelterId, tab, fetchShelterApplications]);

  const shelter = useMemo(
    () => shelters.find((s) => s.id === shelterId) ?? null,
    [shelters, shelterId],
  );

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.WEB_MANAGER_SHELTERS}
        className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToShelters')}
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-text-primary">{shelter?.name ?? t('loading')}</h1>
        {shelter && (
          <p className="text-sm text-text-tertiary mt-1">
            {shelter.city} · {t(`shelters.${shelter.verification_status}` as unknown as 'shelters.verified')}
          </p>
        )}
      </header>

      <div role="tablist" aria-label={t('tabsLabel')} className="flex gap-2 border-b border-border-tertiary">
        <button
          role="tab"
          aria-selected={tab === 'info'}
          type="button"
          onClick={() => setTab('info')}
          className={`text-sm px-4 py-2 border-b-2 transition-colors ${
            tab === 'info'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {t('tabInfo')}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'applications'}
          type="button"
          onClick={() => setTab('applications')}
          className={`text-sm px-4 py-2 border-b-2 transition-colors ${
            tab === 'applications'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {t('tabApplications')}
        </button>
      </div>

      {tab === 'info' && (
        <div className="rounded-2xl border border-border-primary bg-surface-primary p-5 space-y-2">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-text-quaternary uppercase">{t('infoOwnerEmail')}</dt>
              <dd className="text-text-primary">{shelter?.owner_email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-quaternary uppercase">{t('infoCity')}</dt>
              <dd className="text-text-primary">{shelter?.city ?? '—'}</dd>
            </div>
            {shelter?.description && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-text-quaternary uppercase">{t('infoDescription')}</dt>
                <dd className="text-text-primary whitespace-pre-line">{shelter.description}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {tab === 'applications' && (
        <AdminApplicationsTable items={applications} loading={loadingApps} showShelter={false} />
      )}
    </div>
  );
}
