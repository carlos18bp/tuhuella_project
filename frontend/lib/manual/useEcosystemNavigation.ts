'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ecosystemTour, resolveEcosystemState } from './ecosystem';

function replaceQuery(query: string) {
  // Next.js integrates native history with useSearchParams. This map is entirely
  // local: changing a node must not wait for a server navigation or lose a reload.
  window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
}

export function useEcosystemNavigation() {
  const params = useSearchParams();
  const query = params.toString();
  const state = resolveEcosystemState(new URLSearchParams(query));

  function urlFor(nodeId: string, tour: string | null, showRelations: boolean) {
    const next = new URLSearchParams(query);
    next.delete('node');
    next.delete('tour');
    next.delete('relations');
    if (nodeId !== 'tuhuella') next.set('node', nodeId);
    if (tour) next.set('tour', tour);
    if (!showRelations) next.set('relations', '0');
    return next.toString();
  }

  const canonicalQuery = urlFor(state.nodeId, state.tour, state.showRelations);
  useEffect(() => {
    if (canonicalQuery !== query) {
      replaceQuery(canonicalQuery);
    }
  }, [canonicalQuery, query]);

  function update(nodeId: string, tour: string | null, showRelations = state.showRelations) {
    const next = urlFor(nodeId, tour, showRelations);
    replaceQuery(next);
  }
  function select(nodeId: string) {
    const tour = ecosystemTour(state.tour).some((node) => node.id === nodeId) ? state.tour : null;
    update(nodeId, tour);
  }
  function startTour(spaceId: string) {
    const first = ecosystemTour(spaceId)[0];
    if (first) update(first.id, spaceId);
  }

  return {
    ...state,
    select,
    startTour,
    stopTour: () => update(state.nodeId, null),
    toggleRelations: () => update(state.nodeId, state.tour, !state.showRelations),
  };
}
