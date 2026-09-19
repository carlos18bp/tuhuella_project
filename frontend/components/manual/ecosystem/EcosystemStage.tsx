'use client';

import type { RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Minus, Plus, Pause, Play, RotateCcw } from 'lucide-react';
import { ecosystemViewCount } from '@/lib/manual/ecosystem';
import type { EcosystemNode } from '@/lib/manual/ecosystemTypes';
import { orbitalPosition, useEcosystemOrbit } from '@/lib/manual/useEcosystemOrbit';
import EcosystemIcon from './EcosystemIcon';

type Props = {
  node: EcosystemNode;
  previewId: string | null;
  stageRef: RefObject<HTMLDivElement | null>;
  orbit: ReturnType<typeof useEcosystemOrbit>;
  showRelations: boolean;
  onToggleRelations: () => void;
  onPreview: (id: string | null) => void;
  onSelect: (id: string) => void;
  onBack: () => void;
  canGoBack: boolean;
};
export default function EcosystemStage({ node, previewId, stageRef, orbit, showRelations, onToggleRelations, onPreview, onSelect, onBack, canGoBack }: Props) {
  const t = useTranslations('manual.ecosystem');
  const title = (id: string) => t(`nodes.${id}.title`);
  const positions = node.children.map((child, index) => ({ node: child, ...orbitalPosition(index, node.children.length, orbit.angle, orbit.zoom) }));
  const byId = new Map(positions.map((position) => [position.node.id, position]));
  const button = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border-primary bg-surface-primary p-2 text-text-secondary hover:bg-surface-hover disabled:opacity-40';
  const controls = [
    { key: 'rotateLeft', icon: ArrowLeft, action: () => orbit.rotate(-15) },
    { key: 'rotateRight', icon: ArrowRight, action: () => orbit.rotate(15) },
    { key: 'zoomOut', icon: Minus, action: () => orbit.zoomBy(-0.04), disabled: orbit.zoom <= 0.82 },
    { key: 'zoomIn', icon: Plus, action: () => orbit.zoomBy(0.04), disabled: orbit.zoom >= 1.06 },
    { key: 'reset', icon: RotateCcw, action: orbit.reset },
  ];
  const related = new Set(node.relations.filter((relation) => relation.from === previewId || relation.to === previewId).flatMap((relation) => [relation.from, relation.to]));

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-border-primary bg-surface-secondary" aria-label={t('stage')}>
      <div className="space-y-3 border-b border-border-primary p-4">
        <div className="flex flex-wrap items-center gap-2">
          {canGoBack && <button type="button" className={button + ' gap-2 px-3 text-sm'} onClick={onBack}><ArrowLeft className="h-4 w-4" aria-hidden="true" />{t('back')}</button>}
          {node.relations.length > 0 && <button type="button" aria-pressed={showRelations} className={button + ' px-3 text-sm'} onClick={onToggleRelations}>{t(showRelations ? 'hideRelations' : 'showRelations')}</button>}
          <div className="hidden flex-wrap gap-1 xl:flex" aria-label={t('eyebrow')}>
            {controls.map(({ key, icon: Icon, action, disabled }) => <button key={key} type="button" className={button} onClick={action} aria-label={t(key)} title={t(key)} disabled={disabled}><Icon className="h-4 w-4" aria-hidden="true" /></button>)}
            <button type="button" className={button} onClick={orbit.togglePause} aria-label={t(orbit.paused ? 'resume' : 'pause')} title={t(orbit.paused ? 'resume' : 'pause')} aria-pressed={orbit.paused}>
              {orbit.paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <p className="text-xs leading-5 text-text-tertiary"><span className="xl:hidden">{t('cardsHint')}</span><span className="hidden xl:inline">{t('orbitHint')}</span></p>
      </div>
      <div
        ref={stageRef}
        tabIndex={0}
        data-testid="ecosystem-stage"
        data-angle={orbit.angle.toFixed(2)}
        data-zoom={orbit.zoom.toFixed(2)}
        data-rotating={orbit.rotating}
        aria-label={t('stage')}
        className="relative grid gap-3 p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 sm:grid-cols-2 xl:block xl:min-h-[44rem] xl:touch-none"
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); onBack(); return; }
          if (event.target !== event.currentTarget || !orbit.desktop) return;
          if (event.key === 'ArrowLeft') { event.preventDefault(); orbit.rotate(-15); }
          if (event.key === 'ArrowRight') { event.preventDefault(); orbit.rotate(15); }
        }}
        onPointerDown={orbit.startDrag} onPointerMove={orbit.moveDrag}
        onPointerUp={orbit.endDrag} onPointerCancel={orbit.endDrag} onLostPointerCapture={orbit.endDrag}
        onClickCapture={(event) => {
          if (orbit.consumeDrag()) { event.preventDefault(); event.stopPropagation(); }
        }}
        onMouseEnter={() => orbit.setHovered(true)} onMouseLeave={() => { orbit.setHovered(false); onPreview(null); }}
        onFocusCapture={() => orbit.setFocused(true)}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { orbit.setFocused(false); onPreview(null); } }}
      >
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center xl:flex" aria-hidden="true">
          <div className="h-3/4 w-3/4 rounded-full border border-border-primary" />
        </div>
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full xl:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {positions.map((p) => <line key={p.node.id} x1="50" y1="50" x2={p.x} y2={p.y} vectorEffect="non-scaling-stroke" stroke="currentColor" className="text-teal-500/25" />)}
          {showRelations && node.relations.map((relation) => {
            const from = byId.get(relation.from); const to = byId.get(relation.to);
            if (!from || !to) return null;
            const active = relation.from === previewId || relation.to === previewId;
            return <line key={relation.from + relation.to} x1={from.x} y1={from.y} x2={to.x} y2={to.y} vectorEffect="non-scaling-stroke" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeDasharray="5 4" className={active ? 'text-amber-500' : 'text-text-tertiary opacity-40'} data-testid="ecosystem-relation" />;
          })}
        </svg>
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-3xl border border-teal-300 bg-surface-primary px-4 py-6 text-center shadow-lg xl:flex">
          <span className="rounded-2xl bg-teal-700 p-3 text-white"><EcosystemIcon name={node.icon} className="h-7 w-7" /></span>
          <p className="mt-3 text-base font-semibold text-text-primary">{title(node.id)}</p>
          <p className="mt-2 text-xs text-text-tertiary">{t('viewsCount', { count: ecosystemViewCount(node) })}</p>
        </div>
        {positions.map(({ node: child, x, y }, index) => (
          <button
            key={child.id}
            type="button"
            data-testid={`ecosystem-node-${child.id}`}
            className={`relative flex min-h-28 items-center gap-3 rounded-2xl border border-border-primary bg-surface-primary p-4 text-left shadow-sm transition-shadow hover:border-teal-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-teal-500 xl:absolute xl:z-20 xl:w-32 xl:flex-col xl:gap-1 xl:p-3 xl:text-center ${previewId && previewId !== child.id && !related.has(child.id) ? 'xl:opacity-50' : ''}`}
            style={orbit.desktop ? { left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' } : undefined}
            onMouseEnter={() => onPreview(child.id)} onMouseLeave={() => onPreview(null)}
            onFocus={() => onPreview(child.id)}
            onClick={() => onSelect(child.id)}
          >
            <span className="rounded-xl bg-teal-50 p-2 text-teal-700 dark:bg-teal-950 dark:text-teal-300"><EcosystemIcon name={child.icon} /></span>
            <span className="min-w-0">
              <span className="block text-xs text-text-tertiary">{String(index + 1).padStart(2, '0')}</span>
              <span className="mt-1 block text-sm font-semibold leading-5 text-text-primary">{title(child.id)}</span>
            </span>
          </button>
        ))}
        {!positions.length && <p className="relative text-sm text-text-secondary xl:absolute xl:inset-x-8 xl:bottom-8 xl:text-center">{t('noChildren')}</p>}
      </div>
    </section>
  );
}
