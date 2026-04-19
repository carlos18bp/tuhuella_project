'use client';

import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, HelpCircle, CalendarDays } from 'lucide-react';

import type { Animal, DiseaseResult } from '@/lib/types';

interface AnimalHealthSectionProps {
  animal: Pick<
    Animal,
    | 'species'
    | 'is_vaccinated'
    | 'is_sterilized'
    | 'is_dewormed'
    | 'vaccinated_at'
    | 'sterilized_at'
    | 'last_vet_checkup'
    | 'medical_notes_es'
    | 'medical_notes_en'
    | 'disease_screenings'
  >;
}

const resultBadgeClasses: Record<DiseaseResult, string> = {
  negative: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-700/40',
  positive: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-700/40',
  not_tested: 'bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-900/40 dark:text-stone-400 dark:ring-stone-700/40',
};

const resultIconFor = (r: DiseaseResult) =>
  r === 'negative' ? CheckCircle2 : r === 'positive' ? XCircle : HelpCircle;

export default function AnimalHealthSection({ animal }: AnimalHealthSectionProps) {
  const t = useTranslations('animals');
  const locale = useLocale();

  const formatDate = (d?: string | null) => {
    if (!d) return null;
    try {
      return new Intl.DateTimeFormat(locale).format(new Date(d));
    } catch {
      return d;
    }
  };

  const medicalNotes =
    locale === 'es'
      ? animal.medical_notes_es || animal.medical_notes_en
      : animal.medical_notes_en || animal.medical_notes_es;

  const vaccinatedDate = formatDate(animal.vaccinated_at);
  const sterilizedDate = formatDate(animal.sterilized_at);
  const checkupDate = formatDate(animal.last_vet_checkup);

  const pill = (label: string, date: string | null) => (
    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ring-1 font-medium bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-700/40">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      {label}
      {date && <span className="text-emerald-600/80 dark:text-emerald-400/80">· {date}</span>}
    </span>
  );

  const screenings = animal.disease_screenings ?? [];

  return (
    <section data-testid="animal-health-section" className="mt-8">
      <h2 className="text-lg font-semibold text-text-primary mb-3">{t('healthTitle')}</h2>

      <div className="flex flex-wrap gap-2" data-testid="health-pills">
        {animal.is_vaccinated && pill(t('vaccinated'), vaccinatedDate)}
        {animal.is_sterilized && pill(t('sterilized'), sterilizedDate)}
        {animal.is_dewormed && pill(t('dewormed'), null)}
      </div>

      {checkupDate && (
        <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
          <CalendarDays className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />
          <span>
            {t('lastVetCheckup')}: <span className="font-medium text-text-primary">{checkupDate}</span>
          </span>
        </div>
      )}

      {medicalNotes && (
        <div className="mt-4 rounded-2xl border border-border-primary bg-surface-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-1">{t('medicalNotes')}</p>
          <p className="text-sm text-text-secondary whitespace-pre-line">{medicalNotes}</p>
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-text-primary mb-2">{t('diseaseScreenings')}</h3>
        {screenings.length === 0 ? (
          <p className="text-sm text-text-quaternary italic">{t('noScreenings')}</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="disease-screenings-list">
            {screenings.map((s) => {
              const Icon = resultIconFor(s.result);
              const tested = formatDate(s.tested_on);
              return (
                <li
                  key={`${s.disease_key}-${s.id ?? s.result}`}
                  className={`flex items-start gap-2.5 p-3 rounded-xl ring-1 ${resultBadgeClasses[s.result]}`}
                  data-result={s.result}
                >
                  <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {t(`diseases.${s.disease_key}` as unknown as 'diseases.distemper')}
                    </p>
                    <p className="text-xs opacity-80">
                      {t(`result.${s.result}` as unknown as 'result.negative')}
                      {tested ? ` · ${tested}` : ''}
                    </p>
                    {s.notes && <p className="mt-1 text-xs opacity-80">{s.notes}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
