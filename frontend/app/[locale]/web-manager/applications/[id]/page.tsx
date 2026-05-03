'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Bell } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAdoptionStore } from '@/lib/stores/adoptionStore';
import ApplicationStatusBadge from '@/components/ui/ApplicationStatusBadge';
import AdoptionEventTimeline from '@/components/adoption/AdoptionEventTimeline';
import { ROUTES } from '@/lib/constants';

const daysUntil = (target: string | null | undefined): number | null => {
  if (!target) return null;
  const ms = new Date(target).getTime() - Date.now();
  return Math.round(ms / (24 * 60 * 60 * 1000));
};

export default function WebManagerApplicationDetailPage() {
  useRequireAuth();
  const t = useTranslations('webManager.detail');
  const tFollowUp = useTranslations('webManager.followUp');
  const params = useParams();
  const applicationId = Number(params.id);

  const fetchApplication = useAdoptionStore((s) => s.fetchApplication);
  const createEvent = useAdoptionStore((s) => s.createEvent);
  const application = useAdoptionStore((s) => s.applicationsById[applicationId] ?? null);
  const [loading, setLoading] = useState(!application);

  useEffect(() => {
    if (!applicationId) return;
    setLoading(true);
    fetchApplication(applicationId)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [applicationId, fetchApplication]);

  const handleCreateEvent = async (payload: { event_date: string; description: string }) => {
    await createEvent(applicationId, payload);
  };

  if (loading && !application) {
    return (
      <div className="space-y-4">
        <p className="text-text-tertiary">{t('loading')}</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-4">
        <p className="text-text-tertiary">{t('notFound')}</p>
      </div>
    );
  }

  const events = application.events ?? [];
  const followUpDays = daysUntil(application.next_follow_up_due_at);

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.WEB_MANAGER_APPLICATIONS}
        className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{application.animal_name}</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            {application.shelter_name}
            {application.shelter_city ? ` · ${application.shelter_city}` : ''}
          </p>
          <p className="mt-0.5 text-sm text-text-tertiary">
            {t('applicant')}: {application.user_email}
          </p>
          <p className="text-xs text-text-quaternary mt-0.5">
            {t('submittedOn', { date: new Date(application.created_at).toLocaleDateString() })}
          </p>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </header>

      {application.status === 'interview' && followUpDays !== null && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Bell className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-medium">{tFollowUp('label')}</p>
            <p className="text-amber-900/80 mt-0.5">
              {followUpDays >= 0
                ? tFollowUp('dueIn', { days: followUpDays })
                : tFollowUp('overdue', { days: -followUpDays })}
            </p>
          </div>
        </div>
      )}

      <AdoptionEventTimeline
        events={events}
        canCreate={application.status === 'interview' || application.status === 'approved'}
        onCreate={handleCreateEvent}
      />
    </div>
  );
}
