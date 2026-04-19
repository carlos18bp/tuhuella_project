'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import { useFollowUpStore } from '@/lib/stores/followUpStore';
import { useClinicalHistoryStore } from '@/lib/stores/clinicalHistoryStore';
import ClinicalEntryForm from '@/components/veterinarian/ClinicalEntryForm';
import ClinicalHistoryTimeline from '@/components/veterinarian/ClinicalHistoryTimeline';
import { ROUTES } from '@/lib/constants';

export default function VeterinarianFollowUpDetailPage() {
  const t = useTranslations('veterinarian');
  const params = useParams();
  const id = Number(params.id);

  const detail = useFollowUpStore((s) => s.detail);
  const loading = useFollowUpStore((s) => s.loading);
  const fetchDetail = useFollowUpStore((s) => s.fetchDetail);
  const markComplete = useFollowUpStore((s) => s.markComplete);

  const addEntry = useClinicalHistoryStore((s) => s.addEntry);
  const setEntries = useClinicalHistoryStore((s) => s.setEntries);
  const entries = useClinicalHistoryStore((s) => s.entries);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) void fetchDetail(id);
  }, [id, fetchDetail]);

  useEffect(() => {
    if (detail?.clinical_entries) setEntries(detail.clinical_entries);
  }, [detail?.clinical_entries, setEntries]);

  if (loading || !detail) {
    return <p className="text-sm text-text-tertiary">{t('loading')}</p>;
  }

  const handleSubmit = async (payload: Parameters<typeof addEntry>[1]) => {
    if (!detail) return;
    setSubmitting(true);
    try {
      await addEntry(detail.animal, payload);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await markComplete(detail.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.VET_FOLLOW_UPS}
        className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToFollowUps')}
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-text-primary">{detail.animal_name}</h1>
        <p className="text-sm text-text-tertiary mt-1">
          {t('scheduledFor', { date: new Date(detail.scheduled_date).toLocaleDateString() })}
          {' · '}
          {t(`status.${detail.status}`)}
        </p>
      </header>

      {detail.status !== 'completed' && (
        <button
          type="button"
          onClick={handleComplete}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t('markComplete')}
        </button>
      )}

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">{t('clinicalHistoryTitle')}</h2>
        <ClinicalHistoryTimeline entries={entries} />
      </section>

      <ClinicalEntryForm followUpId={detail.id} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
