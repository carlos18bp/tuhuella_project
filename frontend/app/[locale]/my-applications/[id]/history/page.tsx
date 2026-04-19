'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { api } from '@/lib/services/http';
import { useClinicalHistoryStore } from '@/lib/stores/clinicalHistoryStore';
import ClinicalHistoryTimeline from '@/components/veterinarian/ClinicalHistoryTimeline';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import type { AdoptionApplication } from '@/lib/types';

export default function MyApplicationHistoryPage() {
  useRequireAuth();
  const t = useTranslations('myApplications.history');
  const params = useParams();
  const applicationId = Number(params.id);

  const entries = useClinicalHistoryStore((s) => s.entries);
  const fetchEntries = useClinicalHistoryStore((s) => s.fetchForAnimal);
  const [application, setApplication] = useState<AdoptionApplication | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<AdoptionApplication>(API_ENDPOINTS.ADOPTION_DETAIL(applicationId));
        setApplication(res.data);
        if (res.data.animal) void fetchEntries(res.data.animal);
      } catch {
        // Ignore; page will render empty state
      }
    };
    if (applicationId) void load();
  }, [applicationId, fetchEntries]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={ROUTES.MY_APPLICATIONS}
        className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-text-primary">
        {application ? application.animal_name : t('loading')}
      </h1>

      <section className="mt-6 space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">{t('clinicalHistoryTitle')}</h2>
        <ClinicalHistoryTimeline entries={entries} />
      </section>
    </div>
  );
}
