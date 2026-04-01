'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { AdoptionForm, Container } from '@/components/ui';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';

export default function AdoptPage() {
  useRequireAuth();
  const t = useTranslations('adoption');
  const params = useParams();
  const animalId = Number(params.animalId);

  const animal = useAnimalStore((s) => s.animal);
  const loading = useAnimalStore((s) => s.loading);
  const fetchAnimal = useAnimalStore((s) => s.fetchAnimal);
  const user = useAuthStore((s) => s.user);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (animalId) void fetchAnimal(animalId);
  }, [animalId, fetchAnimal]);

  const handleSubmit = async (data: { form_answers: Record<string, string | boolean>; notes: string }) => {
    setSubmitting(true);
    setError('');
    try {
      await api.post(API_ENDPOINTS.ADOPTION_CREATE, {
        animal: animalId,
        form_answers: data.form_answers,
        notes: data.notes,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || t('errorDefault');
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const defaultValues = user
    ? {
        full_name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        phone: user.phone || '',
        city: user.city || '',
      }
    : undefined;

  if (loading || !animal) {
    return (
      <Container className="py-10 min-w-0">
        <div role="status" aria-label="loading" className="mx-auto max-w-2xl">
          <div className="space-y-4">
            <div className="h-6 animate-shimmer rounded w-1/3" />
            <div className="h-4 animate-shimmer rounded w-2/3" />
            <div className="h-40 animate-shimmer rounded-2xl" />
          </div>
        </div>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="py-10 md:py-16 min-w-0">
        <div className="mx-auto max-w-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto ring-1 ring-emerald-200/60 dark:ring-emerald-700/40">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-text-primary heading-decorated-center">{t('successTitle')}</h1>
          <p className="mt-3 text-text-tertiary max-w-md mx-auto">
            {t.rich('successMessage', {
              animalName: animal.name,
              shelterName: animal.shelter_name,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <Link
              href={ROUTES.MY_APPLICATIONS}
              className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-6 py-3 font-medium btn-base"
            >
              {t('viewApplications')}
            </Link>
            <Link
              href={ROUTES.ANIMALS}
              className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto border border-border-secondary text-text-secondary rounded-full px-6 py-3 font-medium hover:bg-surface-hover dark:hover:bg-surface-hover btn-base"
            >
              {t('exploreAnimals')}
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 min-w-0">
      <div className="mx-auto max-w-2xl">
        <Link
          href={ROUTES.ANIMAL_DETAIL(animalId)}
          className="inline-flex items-center gap-1.5 min-h-11 text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors -ml-1 pl-1 pr-2 rounded-lg hover:bg-surface-hover/80 dark:hover:bg-surface-hover/50"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {t('backToAnimal', { animalName: animal.name })}
        </Link>

        <div className="mt-6 rounded-2xl border border-border-primary bg-surface-primary p-6 sm:p-8 shadow-sm">
          <AdoptionForm
            animalName={animal.name}
            onSubmit={handleSubmit}
            submitting={submitting}
            defaultValues={defaultValues}
          />

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/25 dark:text-red-300"
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
