'use client';

import { useTranslations } from 'next-intl';
import { ecosystemTour } from '@/lib/manual/ecosystem';

type Props = { spaceId: string; nodeId: string; onSelect: (id: string) => void; onStop: () => void };
export default function EcosystemTour({ spaceId, nodeId, onSelect, onStop }: Props) {
  const t = useTranslations('manual.ecosystem');
  const steps = ecosystemTour(spaceId);
  const index = steps.findIndex((node) => node.id === nodeId);
  if (index < 0) return null;
  const button = 'min-h-11 rounded-xl border border-teal-300 px-4 py-2 text-sm font-medium text-teal-900 dark:text-teal-300';
  return (
    <section aria-label={t('tour')} className="rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{t('tour')}: {t(`nodes.${spaceId}.title`)}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t('progress', { current: index + 1, total: steps.length })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {index > 0 && <button type="button" className={button} onClick={() => onSelect(steps[index - 1].id)}>{t('previous')}</button>}
          {index < steps.length - 1
            ? <button type="button" className={button} onClick={() => onSelect(steps[index + 1].id)}>{t('next')}</button>
            : <button type="button" className={button} onClick={onStop}>{t('finish')}</button>}
          <button type="button" className={button} onClick={onStop}>{t('exit')}</button>
        </div>
      </div>
      <progress className="mt-3 h-2 w-full accent-teal-600" value={index + 1} max={steps.length} aria-label={t('tour')} />
      <p className="sr-only" role="status">{t('tourAnnouncement', { space: t(`nodes.${spaceId}.title`), current: index + 1, total: steps.length })}</p>
    </section>
  );
}
