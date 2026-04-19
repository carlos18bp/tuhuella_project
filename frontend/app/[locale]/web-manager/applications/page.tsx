'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useWebManagerStore } from '@/lib/stores/webManagerStore';
import AdminApplicationsTable from '@/components/web-manager/AdminApplicationsTable';
import type { AdoptionApplicationStatus } from '@/lib/types';

const STATUS_OPTIONS: AdoptionApplicationStatus[] = [
  'submitted',
  'reviewing',
  'interview',
  'approved',
  'rejected',
];

export default function WebManagerApplicationsPage() {
  const t = useTranslations('webManager');
  const applications = useWebManagerStore((s) => s.applications);
  const meta = useWebManagerStore((s) => s.applicationsMeta);
  const loading = useWebManagerStore((s) => s.applicationsLoading);
  const fetchApplications = useWebManagerStore((s) => s.fetchApplications);

  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    void fetchApplications({ status: statusFilter || undefined, page: 1, page_size: 25 });
  }, [fetchApplications, statusFilter]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">{t('applicationsTitle')}</h1>
        <p className="text-sm text-text-tertiary mt-1">{t('applicationsSubtitle')}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`text-xs px-3 py-1.5 rounded-full ring-1 transition-colors ${
            statusFilter === ''
              ? 'bg-teal-600 text-white ring-teal-600'
              : 'bg-surface-primary text-text-secondary ring-border-primary hover:bg-surface-hover'
          }`}
        >
          {t('filterAll')}
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full ring-1 transition-colors ${
              statusFilter === s
                ? 'bg-teal-600 text-white ring-teal-600'
                : 'bg-surface-primary text-text-secondary ring-border-primary hover:bg-surface-hover'
            }`}
          >
            {t(`status.${s}`)}
          </button>
        ))}
      </div>

      {meta && (
        <p className="text-xs text-text-quaternary">
          {t('resultsCount', { count: meta.count })}
        </p>
      )}

      <AdminApplicationsTable items={applications} loading={loading} showShelter />
    </div>
  );
}
