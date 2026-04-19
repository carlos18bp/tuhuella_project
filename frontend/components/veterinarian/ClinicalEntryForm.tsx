'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import type { ClinicalEntryType, ClinicalEntryPayload } from '@/lib/types';

const ENTRY_TYPES: ClinicalEntryType[] = [
  'checkup',
  'vaccination',
  'treatment',
  'observation',
  'incident',
];

interface ClinicalEntryFormProps {
  followUpId?: number | null;
  onSubmit: (payload: ClinicalEntryPayload) => void | Promise<void>;
  submitting?: boolean;
}

export default function ClinicalEntryForm({ followUpId, onSubmit, submitting = false }: ClinicalEntryFormProps) {
  const t = useTranslations('veterinarian');
  const [entryType, setEntryType] = useState<ClinicalEntryType>('checkup');
  const [title, setTitle] = useState('');
  const [bodyEs, setBodyEs] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit({
      follow_up: followUpId ?? null,
      entry_type: entryType,
      title: title.trim(),
      body_es: bodyEs.trim(),
      body_en: bodyEn.trim(),
      occurred_at: new Date(occurredAt).toISOString(),
    });
  };

  const inputClasses =
    'mt-1 w-full rounded-xl border border-border-primary p-3 text-sm text-text-primary focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border-primary bg-surface-primary p-5">
      <h3 className="text-base font-semibold text-text-primary">{t('addEntryTitle')}</h3>

      <div>
        <label htmlFor="entry-type" className="block text-sm font-medium text-text-secondary">
          {t('fieldEntryType')}
        </label>
        <select
          id="entry-type"
          value={entryType}
          onChange={(e) => setEntryType(e.target.value as ClinicalEntryType)}
          className={inputClasses}
        >
          {ENTRY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`entryType.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="entry-title" className="block text-sm font-medium text-text-secondary">
          {t('fieldTitle')}
        </label>
        <input
          id="entry-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="entry-occurred-at" className="block text-sm font-medium text-text-secondary">
          {t('fieldOccurredAt')}
        </label>
        <input
          id="entry-occurred-at"
          type="datetime-local"
          required
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="entry-body-es" className="block text-sm font-medium text-text-secondary">
          {t('fieldBodyEs')}
        </label>
        <textarea
          id="entry-body-es"
          rows={3}
          value={bodyEs}
          onChange={(e) => setBodyEs(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="entry-body-en" className="block text-sm font-medium text-text-secondary">
          {t('fieldBodyEn')}
        </label>
        <textarea
          id="entry-body-en"
          rows={3}
          value={bodyEn}
          onChange={(e) => setBodyEn(e.target.value)}
          className={inputClasses}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-teal-500 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? t('submitting') : t('addEntrySubmit')}
      </button>
    </form>
  );
}
