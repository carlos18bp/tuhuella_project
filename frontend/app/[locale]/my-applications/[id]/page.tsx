'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, FileText } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAdoptionStore } from '@/lib/stores/adoptionStore';
import ApplicationStatusBadge from '@/components/ui/ApplicationStatusBadge';
import ApplicationTimeline from '@/components/ui/ApplicationTimeline';
import WhatsAppContactCard from '@/components/adoption/WhatsAppContactCard';
import AdoptionEventTimeline from '@/components/adoption/AdoptionEventTimeline';
import { ROUTES } from '@/lib/constants';

export default function MyApplicationDetailPage() {
  useRequireAuth();
  const t = useTranslations('myApplications.detail');
  const tContact = useTranslations('adoption.contact');
  const params = useParams();
  const applicationId = Number(params.id);

  const fetchApplication = useAdoptionStore((s) => s.fetchApplication);
  const application = useAdoptionStore((s) => s.applicationsById[applicationId] ?? null);
  const [loading, setLoading] = useState(!application);

  useEffect(() => {
    if (!applicationId) return;
    setLoading(true);
    fetchApplication(applicationId)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [applicationId, fetchApplication]);

  if (loading && !application) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-text-tertiary">{t('loading')}</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-text-tertiary">{t('notFound')}</p>
      </div>
    );
  }

  const events = application.events ?? [];
  const submittedDate = new Date(application.created_at).toLocaleDateString();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <Link
        href={ROUTES.MY_APPLICATIONS}
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
          <p className="text-xs text-text-quaternary mt-0.5">
            {t('submittedOn', { date: submittedDate })}
          </p>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </header>

      <ApplicationTimeline status={application.status} />

      {application.shelter_whatsapp ? (
        <WhatsAppContactCard
          phone={application.shelter_whatsapp}
          contactName={application.shelter_name ?? ''}
          intro={tContact('introToShelter', { animal: application.animal_name })}
          buttonLabel={tContact('chatWithShelter')}
          prefilledMessage={tContact('messageToShelter', {
            animal: application.animal_name,
          })}
        />
      ) : null}

      <AdoptionEventTimeline events={events} canCreate={false} />

      <div>
        <Link
          href={`${ROUTES.MY_APPLICATIONS}/${application.id}/history`}
          className="inline-flex items-center gap-2 rounded-full border border-border-primary bg-surface-primary px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
        >
          <FileText className="h-4 w-4" />
          {t('viewClinicalHistory')}
        </Link>
      </div>
    </div>
  );
}
