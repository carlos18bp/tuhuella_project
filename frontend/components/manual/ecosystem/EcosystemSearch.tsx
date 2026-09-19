'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ecosystemPath, searchEcosystem } from '@/lib/manual/ecosystem';

export default function EcosystemSearch({ onSelect }: { onSelect: (id: string) => void }) {
  const t = useTranslations('manual.ecosystem');
  const id = useId();
  const [query, setQuery] = useState('');
  const results = searchEcosystem(query, (nodeId) => ['title', 'summary', 'value'].map((field) => t(`nodes.${nodeId}.${field}`)).join(' '));
  return (
    <div className="relative w-full xl:max-w-md" onKeyDown={(event) => {
      if (event.key === 'Escape') { setQuery(''); event.stopPropagation(); }
    }}>
      <label htmlFor={id} className="sr-only">{t('searchLabel')}</label>
      <div className="flex gap-2">
        <input id={id} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} autoComplete="off" className="min-h-11 w-full rounded-xl border border-border-primary bg-surface-primary px-4 py-2 text-sm text-text-primary" />
        {query && <button type="button" className="shrink-0 rounded-xl px-3 text-sm text-teal-700 dark:text-teal-300" onClick={() => setQuery('')}>{t('clearSearch')}</button>}
      </div>
      {query.trim() && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border-primary bg-surface-primary shadow-lg" aria-label={t('searchLabel')}>
          {results.map((node) => (
            <button key={node.id} type="button" onClick={() => { setQuery(''); onSelect(node.id); }} className="block w-full border-b border-border-primary px-4 py-3 text-left hover:bg-surface-hover">
              <span className="block text-sm font-semibold text-text-primary">{t(`nodes.${node.id}.title`)}</span>
              <span className="mt-1 block text-xs text-text-tertiary">{ecosystemPath(node.id).slice(1).map((entry) => t(`nodes.${entry.id}.title`)).join(' / ')}</span>
            </button>
          ))}
          {!results.length && <p role="status" className="p-4 text-sm text-text-secondary">{t('noResults')}</p>}
        </div>
      )}
    </div>
  );
}
