'use client';

import { useLocale, useTranslations } from 'next-intl';

import type { ClinicalHistoryEntry } from '@/lib/types';

interface ClinicalHistoryTimelineProps {
  entries: ClinicalHistoryEntry[];
}

export default function ClinicalHistoryTimeline({ entries }: ClinicalHistoryTimelineProps) {
  const t = useTranslations('veterinarian');
  const locale = useLocale();

  if (entries.length === 0) {
    return <p className="text-sm text-text-tertiary">{t('noClinicalEntries')}</p>;
  }

  return (
    <ol className="space-y-3">
      {entries.map((e) => {
        const body = locale === 'es' ? e.body_es || e.body_en : e.body_en || e.body_es;
        return (
          <li key={e.id} className="rounded-2xl border border-border-primary bg-surface-primary p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-text-primary">{e.title}</p>
              <span className="text-xs text-text-quaternary">
                {new Date(e.occurred_at).toLocaleString(locale)}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wide text-teal-600 mt-1">
              {t(`entryType.${e.entry_type}`)}
            </p>
            {body && <p className="text-sm text-text-secondary mt-2 whitespace-pre-line">{body}</p>}
          </li>
        );
      })}
    </ol>
  );
}
