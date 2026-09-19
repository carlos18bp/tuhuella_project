'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/lib/stores/authStore';
import { ecosystemPath, findEcosystemNode } from '@/lib/manual/ecosystem';
import { useEcosystemNavigation } from '@/lib/manual/useEcosystemNavigation';
import { useEcosystemOrbit } from '@/lib/manual/useEcosystemOrbit';
import EcosystemContext from './EcosystemContext';
import EcosystemSearch from './EcosystemSearch';
import EcosystemStage from './EcosystemStage';
import EcosystemTour from './EcosystemTour';

export default function EcosystemExplorer() {
  const t = useTranslations('manual.ecosystem');
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.isAuthReady && s.isAuthenticated);
  const navigation = useEcosystemNavigation();
  const node = findEcosystemNode(navigation.nodeId);
  const path = ecosystemPath(node.id);
  const stageRef = useRef<HTMLDivElement>(null);
  const orbit = useEcosystemOrbit(stageRef, Boolean(navigation.tour) || !ready);
  const [preview, setPreview] = useState<{ parent: string; id: string | null }>({ parent: '', id: null });
  const previewId = preview.parent === node.id ? preview.id : null;
  const displayNode = previewId ? findEcosystemNode(previewId) : node;
  const previousNode = useRef(node.id);

  useEffect(() => {
    if (previousNode.current !== node.id) {
      stageRef.current?.focus({ preventScroll: true });
      previousNode.current = node.id;
    }
  }, [node.id]);

  function select(id: string) {
    setPreview({ parent: node.id, id: null });
    navigation.select(id);
  }
  const title = (id: string) => t(`nodes.${id}.title`);
  const back = () => { if (path.length > 1) select(path[path.length - 2].id); };
  const relations = previewId ? node.relations.filter((r) => r.from === previewId || r.to === previewId) : node.relations;

  return (
    <div className="space-y-6" data-testid="ecosystem-explorer">
      <header>
        <Link href={ROUTES.MANUAL} className="inline-block min-h-11 py-2 text-sm font-semibold text-teal-700 underline underline-offset-4 dark:text-teal-300">{t('backManual')}</Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">{t('title')}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">{t('intro')}</p>
      </header>
      <div className="flex flex-col gap-4 rounded-2xl border border-border-primary bg-surface-primary p-4 xl:flex-row xl:items-center xl:justify-between">
        <nav aria-label={t('breadcrumb')} className="flex min-w-0 flex-wrap items-center gap-2">
          {path.map((part, index) => (
            <span key={part.id} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-text-tertiary">/</span>}
              <button type="button" onClick={() => select(part.id)} aria-current={part.id === node.id ? 'page' : undefined} className="min-h-11 text-left text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300">{title(part.id)}</button>
            </span>
          ))}
        </nav>
        <EcosystemSearch onSelect={select} />
      </div>
      {navigation.tour && <EcosystemTour spaceId={navigation.tour} nodeId={node.id} onSelect={select} onStop={navigation.stopTour} />}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <EcosystemStage node={node} stageRef={stageRef} orbit={orbit} previewId={previewId} showRelations={navigation.showRelations} onToggleRelations={navigation.toggleRelations} onPreview={(id) => setPreview({ parent: node.id, id })} onSelect={select} onBack={back} canGoBack={path.length > 1} />
        <EcosystemContext node={displayNode} user={user} preview={Boolean(previewId)} touring={Boolean(navigation.tour)} onSelect={select} onStartTour={navigation.startTour} />
      </div>
      <section className="rounded-2xl border border-border-primary bg-surface-primary p-5" aria-label={t('connections')}>
        <h2 className="text-lg font-semibold text-text-primary">{t('connections')}</h2>
        <div className="mt-3 flex flex-wrap gap-5 text-xs text-text-tertiary">
          <span className="flex items-center gap-2"><span className="w-7 border-t border-teal-500" aria-hidden="true" />{t('hierarchy')}</span>
          <span className="flex items-center gap-2"><span className="w-7 border-t border-dashed border-text-tertiary" aria-hidden="true" />{t('relationship')}</span>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {relations.map((relation) => <li key={relation.from + relation.to} className="rounded-xl bg-surface-secondary p-3 text-sm leading-6 text-text-secondary"><strong>{title(relation.from)}</strong> → {t(`relations.${relation.label}`)} → <strong>{title(relation.to)}</strong></li>)}
        </ul>
        {!relations.length && <p className="mt-4 text-sm text-text-secondary">{t('noRelations')}</p>}
        {orbit.reducedMotion && <p className="mt-4 text-xs text-text-tertiary">{t('reducedMotion')}</p>}
      </section>
    </div>
  );
}
