'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import type { AdoptionApplication, AdoptionApplicationStatus } from '@/lib/types';

const statusBadge: Record<AdoptionApplicationStatus, string> = {
  submitted: 'bg-amber-50 text-amber-700 ring-amber-200',
  reviewing: 'bg-sky-50 text-sky-700 ring-sky-200',
  interview: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
};

interface AdminApplicationsTableProps {
  items: AdoptionApplication[];
  loading?: boolean;
  showShelter?: boolean;
}

export default function AdminApplicationsTable({
  items,
  loading = false,
  showShelter = true,
}: AdminApplicationsTableProps) {
  const t = useTranslations('webManager');

  if (loading) {
    return (
      <div role="status" aria-label="loading" className="py-10 text-center text-text-tertiary">
        {t('loading')}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="py-8 text-center text-text-tertiary">{t('noApplications')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-primary bg-surface-primary">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-secondary">
          <tr className="text-left text-xs uppercase tracking-wide text-text-quaternary">
            <th scope="col" className="px-4 py-3">{t('tableAnimal')}</th>
            {showShelter && <th scope="col" className="px-4 py-3">{t('tableShelter')}</th>}
            <th scope="col" className="px-4 py-3">{t('tableApplicant')}</th>
            <th scope="col" className="px-4 py-3">{t('tableStatus')}</th>
            <th scope="col" className="px-4 py-3">{t('tableCreatedAt')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((app) => (
            <tr key={app.id} className="border-t border-border-tertiary hover:bg-surface-hover transition-colors">
              <td className="px-4 py-3 font-medium text-text-primary">
                <Link
                  href={ROUTES.WEB_MANAGER_APPLICATION_DETAIL(app.id)}
                  className="hover:text-teal-600 transition-colors"
                >
                  {app.animal_name}
                </Link>
              </td>
              {showShelter && <td className="px-4 py-3 text-text-secondary">{app.shelter_name ?? '—'}</td>}
              <td className="px-4 py-3 text-text-secondary">{app.user_email}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex text-xs px-2 py-1 rounded-full ring-1 font-medium ${statusBadge[app.status]}`}>
                  {t(`status.${app.status}`)}
                </span>
              </td>
              <td className="px-4 py-3 text-text-tertiary">
                {new Date(app.created_at).toLocaleDateString('es')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
