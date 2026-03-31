'use client';

import { useSyncExternalStore } from 'react';

/** Tailwind default `sm` breakpoint */
export const TW_SM_MIN_WIDTH_PX = 640;

/** Tailwind default `md` breakpoint */
export const TW_MD_MIN_WIDTH_PX = 768;

function subscribe(query: string, onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getMatches(query: string) {
  return window.matchMedia(query).matches;
}

/**
 * Subscribes to `window.matchMedia(query)`. SSR / hydration uses `ssrMatches` so server
 * and first client paint stay aligned (mobile-first: pass `false` for min-width queries).
 */
export function useMediaQuery(query: string, ssrMatches = false): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getMatches(query),
    () => ssrMatches,
  );
}

export function useMinWidthSm(): boolean {
  return useMediaQuery(`(min-width: ${TW_SM_MIN_WIDTH_PX}px)`, false);
}

export function useMinWidthMd(): boolean {
  return useMediaQuery(`(min-width: ${TW_MD_MIN_WIDTH_PX}px)`, false);
}
