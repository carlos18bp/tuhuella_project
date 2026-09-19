'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import { canOpenEcosystemView, ecosystemViewCount, ecosystemViews } from '@/lib/manual/ecosystem';
import { MANUAL_SECTIONS } from '@/lib/manual/content';
import { canViewManualAudience } from '@/lib/manual/filterByRole';
import type { EcosystemNode, EcosystemUser } from '@/lib/manual/ecosystemTypes';
import EcosystemIcon from './EcosystemIcon';

type Props = {
  node: EcosystemNode;
  user: EcosystemUser;
  preview: boolean;
  touring: boolean;
  onSelect: (id: string) => void;
  onStartTour: (id: string) => void;
};

export default function EcosystemContext({ node, user, preview, touring, onSelect, onStartTour }: Props) {
  const t = useTranslations('manual.ecosystem');
  const locale = useLocale() === 'en' ? 'en' : 'es';
  const screens = ecosystemViews(node);
  const processIds = new Set(screens.flatMap((screen) => screen.processIds || []));
  const processes = MANUAL_SECTIONS.flatMap((section) => section.processes)
    .filter((process) => processIds.has(process.id) && canViewManualAudience(user?.role, process.audience));
  const title = (id: string) => t(`nodes.${id}.title`);

  return (
    <article className="min-w-0 rounded-2xl border border-border-primary bg-surface-primary p-5 shadow-sm" data-testid="ecosystem-context">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-teal-100 p-3 text-teal-700 dark:bg-teal-950 dark:text-teal-300"><EcosystemIcon name={node.icon} /></span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{t(preview ? 'preview' : 'context')}</p>
          <h2 className="mt-1 break-words text-xl font-semibold text-text-primary">{title(node.id)}</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{t(`nodes.${node.id}.summary`)}</p>
      <p className="mt-3 text-xs font-medium text-teal-700 dark:text-teal-300">{t('viewsCount', { count: ecosystemViewCount(node) })}</p>
      {node.kind !== 'view' && (
        <div className="mt-4 rounded-xl bg-teal-50 p-4 dark:bg-teal-950/40">
          <h3 className="text-xs font-semibold uppercase text-teal-800 dark:text-teal-300">{t('value')}</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{t(`nodes.${node.id}.value`)}</p>
        </div>
      )}
      {node.kind === 'space' && !preview && !touring && (
        <button type="button" onClick={() => onStartTour(node.id)} className="mt-5 min-h-11 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">{t('startTour')}</button>
      )}
      {node.children.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-text-primary">{t('children')}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {node.children.map((child) => (
              <button key={child.id} type="button" onClick={() => onSelect(child.id)} className="min-h-11 rounded-xl border border-border-primary px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover">{title(child.id)}</button>
            ))}
          </div>
        </div>
      )}
      {(node.kind === 'view' || node.kind === 'module') && screens.map((screen) => {
        const view = screen.view!;
        const allowed = canOpenEcosystemView(view, user);
        const indirect = view.notice === 'selection';
        return (
          <div key={screen.id} className="mt-4 rounded-xl border border-border-primary p-3">
            {node.kind !== 'view' && <h3 className="text-sm font-semibold text-text-primary">{title(screen.id)}</h3>}
            <p className="mt-1 text-xs leading-5 text-text-tertiary">{t('restricted', { role: t(`roles.${view.access}`) })}</p>
            {view.notice && <p className="mt-2 text-xs leading-5 text-text-secondary">{t(view.notice)}</p>}
            {allowed && (
              <Link href={view.destination!} prefetch={false} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-teal-700 underline underline-offset-4 dark:text-teal-300" aria-label={`${t(indirect ? 'chooseRecord' : 'openScreen')}: ${title(screen.id)}`}>
                {t(indirect ? 'chooseRecord' : 'openScreen')}
              </Link>
            )}
          </div>
        );
      })}
      {processes.length > 0 && (
        <details className="mt-5 rounded-xl border border-border-primary p-3">
          <summary className="cursor-pointer text-sm font-semibold text-text-primary">{t('readGuide')}</summary>
          <ul className="mt-2 space-y-2">
            {processes.map((process) => (
              <li key={process.id}>
                <Link href={`${ROUTES.MANUAL}#${process.id}`} className="inline-block py-2 text-sm text-teal-700 underline underline-offset-4 dark:text-teal-300">{process.title[locale]}</Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
