'use client';

import { useTranslations } from 'next-intl';

import RoleBadge from './RoleBadge';
import type { ManualLocale, ManualProcess } from '@/lib/manual/types';

type Props = {
  process: ManualProcess;
  locale: ManualLocale;
};

export default function ProcessCard({ process, locale }: Props) {
  const t = useTranslations('manual');
  const k = (key: string) => t(`card.${key}`);

  return (
    <article
      id={process.id}
      className="scroll-mt-24 rounded-2xl border border-border-primary bg-surface-primary p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{process.title[locale]}</h3>
          <p className="mt-1 text-sm text-text-secondary">{process.summary[locale]}</p>
        </div>
        <RoleBadge audience={process.audience} />
      </header>

      <section className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-quaternary">
          {k('why')}
        </h4>
        <p className="mt-1 text-sm text-text-secondary">{process.why[locale]}</p>
      </section>

      <section className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-quaternary">
          {k('steps')}
        </h4>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-text-secondary marker:text-teal-600">
          {process.steps[locale].map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      {process.route && (
        <section className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-quaternary">
            {k('route')}
          </h4>
          <code className="mt-1 inline-block rounded-md bg-surface-secondary px-2 py-1 text-xs text-text-primary">
            {process.route}
          </code>
        </section>
      )}

      {process.tips && process.tips[locale].length > 0 && (
        <section className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/60 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200">
            {k('tips')}
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-amber-900 dark:text-amber-100">
            {process.tips[locale].map((tip, idx) => (
              <li key={idx} className="flex gap-2">
                <span aria-hidden="true">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
