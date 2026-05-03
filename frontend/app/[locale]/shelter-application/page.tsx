'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, FileText, ScrollText, Sparkles } from 'lucide-react';

import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  useShelterApplicationStore,
  type ShelterApplicationPayload,
} from '@/lib/stores/shelterApplicationStore';

type FormState = ShelterApplicationPayload & {
  capacity_estimate: number | null;
};

const EMPTY_FORM: FormState = {
  shelter_name: '',
  description_es: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  legal_name: '',
  tax_id: '',
  legal_representative_name: '',
  legal_representative_id: '',
  motivation: '',
  previous_experience: '',
  capacity_estimate: null,
};

const inputClass =
  'mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary bg-surface-primary focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none';

export default function ShelterApplicationPage() {
  useRequireAuth();
  const router = useRouter();
  const t = useTranslations('shelterApplication');

  const user = useAuthStore((s) => s.user);
  const application = useShelterApplicationStore((s) => s.application);
  const fetchMine = useShelterApplicationStore((s) => s.fetchMine);
  const submit = useShelterApplicationStore((s) => s.submit);
  const submitting = useShelterApplicationStore((s) => s.submitting);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchMine();
  }, [fetchMine]);

  const isPending = useMemo(() => {
    if (!application) return false;
    return ['submitted', 'under_review', 'approved'].includes(application.status);
  }, [application]);

  if (user && user.role !== 'adopter' && user.role !== 'shelter_admin') {
    // Other roles (vet, web_manager, admin) shouldn't see this flow.
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-text-secondary">{t('notAvailableForRole')}</p>
      </div>
    );
  }

  if (isPending && application) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('statusTitle')}</h1>
        <div className="mt-6 rounded-2xl border border-border-primary p-6 bg-surface-primary">
          <p className="text-sm text-text-tertiary uppercase">{t('statusLabel')}</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {t(`status_${application.status}`)}
          </p>
          <p className="mt-4 text-text-secondary">{t(`statusBody_${application.status}`)}</p>
          {application.status === 'approved' && (
            <button
              type="button"
              onClick={() => router.push(ROUTES.SHELTER_DASHBOARD)}
              className="mt-6 inline-flex items-center justify-center min-h-11 bg-emerald-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-emerald-700"
            >
              {t('goToDashboard')}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (application?.status === 'rejected') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('statusTitle')}</h1>
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/25 dark:border-red-800/40 p-6">
          <p className="text-sm uppercase text-red-700 dark:text-red-300">{t('status_rejected')}</p>
          <p className="mt-2 text-text-secondary">{t('statusBody_rejected')}</p>
          {application.rejection_reason && (
            <p className="mt-3 text-sm text-text-primary">
              <span className="font-semibold">{t('rejectionReasonLabel')}:</span>{' '}
              {application.rejection_reason}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              useShelterApplicationStore.getState().reset();
              setStep(1);
              setForm(EMPTY_FORM);
            }}
            className="mt-6 inline-flex items-center justify-center min-h-11 bg-emerald-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-emerald-700"
          >
            {t('reapply')}
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'capacity_estimate' ? (value ? Number(value) : null) : value,
    }));
  };

  const validateStep = (): string => {
    if (step === 1) {
      if (!form.shelter_name.trim()) return t('errors.shelterNameRequired');
      if (!form.description_es.trim()) return t('errors.descriptionRequired');
      if (!form.city.trim()) return t('errors.cityRequired');
      if (!form.phone.trim()) return t('errors.phoneRequired');
    }
    if (step === 2) {
      if (!form.legal_name.trim()) return t('errors.legalNameRequired');
      if (!form.tax_id.trim()) return t('errors.taxIdRequired');
      if (!form.legal_representative_name.trim()) return t('errors.repNameRequired');
      if (!form.legal_representative_id.trim()) return t('errors.repIdRequired');
    }
    if (step === 4) {
      if (!form.motivation.trim()) return t('errors.motivationRequired');
    }
    return '';
  };

  const handleNext = () => {
    const stepError = validateStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError('');
    setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  };

  const handleBack = () => {
    setError('');
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));
  };

  const handleSubmit = async () => {
    const stepError = validateStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    try {
      await submit(form);
      router.push(ROUTES.MY_PROFILE);
    } catch {
      setError(t('errors.submitFailed'));
    }
  };

  const stepIcons = [Building2, ScrollText, FileText, Sparkles];
  const StepIcon = stepIcons[step - 1];

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 min-w-0 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('title')}</h1>
      <p className="mt-2 text-text-tertiary">{t('subtitle')}</p>

      <div className="mt-6 flex items-center gap-2 text-sm">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`flex-1 h-1.5 rounded-full ${
              n <= step ? 'bg-emerald-500' : 'bg-border-primary'
            }`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
        <StepIcon className="h-4 w-4 text-emerald-600" />
        <span>{t(`step${step}.title`)}</span>
        <span className="text-text-tertiary">· {t('stepCounter', { current: step, total: 4 })}</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 4) handleNext();
          else void handleSubmit();
        }}
        className="mt-8 space-y-5"
      >
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 dark:bg-red-950/25 dark:border-red-800/40 dark:text-red-300">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="shelter_name" className="block text-sm font-medium text-text-secondary">
                {t('fields.shelterName')} *
              </label>
              <input
                id="shelter_name"
                name="shelter_name"
                value={form.shelter_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="description_es" className="block text-sm font-medium text-text-secondary">
                {t('fields.description')} *
              </label>
              <textarea
                id="description_es"
                name="description_es"
                value={form.description_es}
                onChange={handleChange}
                rows={3}
                className={inputClass}
                placeholder={t('fields.descriptionPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-text-secondary">
                  {t('fields.city')} *
                </label>
                <input id="city" name="city" value={form.city} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-text-secondary">
                  {t('fields.address')}
                </label>
                <input id="address" name="address" value={form.address} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">
                  {t('fields.phone')} *
                </label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                  {t('fields.email')}
                </label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-text-secondary">
                {t('fields.website')}
              </label>
              <input
                id="website"
                name="website"
                type="text"
                inputMode="url"
                value={form.website}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="legal_name" className="block text-sm font-medium text-text-secondary">
                {t('fields.legalName')} *
              </label>
              <input id="legal_name" name="legal_name" value={form.legal_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="tax_id" className="block text-sm font-medium text-text-secondary">
                {t('fields.taxId')} *
              </label>
              <input id="tax_id" name="tax_id" value={form.tax_id} onChange={handleChange} className={inputClass} placeholder="900-1234567-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="legal_representative_name" className="block text-sm font-medium text-text-secondary">
                  {t('fields.repName')} *
                </label>
                <input
                  id="legal_representative_name"
                  name="legal_representative_name"
                  value={form.legal_representative_name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="legal_representative_id" className="block text-sm font-medium text-text-secondary">
                  {t('fields.repId')} *
                </label>
                <input
                  id="legal_representative_id"
                  name="legal_representative_id"
                  value={form.legal_representative_id}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 dark:bg-emerald-950/25 dark:border-emerald-800/60 p-4 text-sm text-text-secondary">
              <p className="font-semibold text-text-primary">{t('step3.uploadTitle')}</p>
              <p className="mt-2 leading-relaxed">{t('step3.uploadHelp')}</p>
              <p className="mt-3 text-xs text-text-tertiary">{t('step3.uploadDeferred')}</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-text-secondary">
                {t('fields.motivation')} *
              </label>
              <textarea
                id="motivation"
                name="motivation"
                value={form.motivation}
                onChange={handleChange}
                rows={4}
                className={inputClass}
                placeholder={t('fields.motivationPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="previous_experience" className="block text-sm font-medium text-text-secondary">
                {t('fields.previousExperience')}
              </label>
              <textarea
                id="previous_experience"
                name="previous_experience"
                value={form.previous_experience}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="capacity_estimate" className="block text-sm font-medium text-text-secondary">
                {t('fields.capacityEstimate')}
              </label>
              <input
                id="capacity_estimate"
                name="capacity_estimate"
                type="number"
                min={0}
                value={form.capacity_estimate ?? ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className="inline-flex items-center justify-center min-h-11 rounded-full px-5 py-2.5 text-sm font-medium border border-border-primary text-text-primary disabled:opacity-50"
          >
            {t('back')}
          </button>
          {step < 4 ? (
            <button
              type="submit"
              className="inline-flex items-center justify-center min-h-11 bg-emerald-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-emerald-700"
            >
              {t('next')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center min-h-11 bg-emerald-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? t('submitting') : t('submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
