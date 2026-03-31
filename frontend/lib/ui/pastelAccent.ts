/**
 * Shared pastel / accent utility classes (light + dark) for hero pills, CTAs, icon wrappers
 * and small badges — keep Home, About and animal detail aligned.
 */

export type PastelTone = 'teal' | 'amber' | 'emerald' | 'rose';

const GRADIENT_BR: Record<PastelTone, string> = {
  teal: 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/30',
  amber: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/45 dark:to-amber-900/25',
  emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-200 dark:from-emerald-950/40 dark:to-emerald-900/20',
  rose: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/25',
};

const STEP_NUMBER_TEXT: Record<PastelTone, string> = {
  teal: 'text-teal-600 dark:text-teal-400',
  amber: 'text-amber-600 dark:text-amber-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  rose: 'text-rose-600 dark:text-rose-400',
};

/** Hero / page badge (teal pill) — Home, About */
export const heroTealPillClass =
  'inline-flex items-center text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 dark:text-teal-300 dark:bg-teal-950/50 dark:border-teal-500/30';

/** Primary outline CTA (amber) — Home, About; animal sponsor adds `btn-base` only if not already in string */
export const ctaAmberOutlineClass =
  'inline-flex justify-center items-center min-h-11 w-full sm:w-auto border border-amber-300 text-amber-700 rounded-full px-6 py-3 font-medium hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-950/35 btn-base shadow-sm';

export function pastelIconCircle12Class(tone: PastelTone): string {
  return `w-12 h-12 rounded-full ${GRADIENT_BR[tone]} flex items-center justify-center mx-auto`;
}

/** Home “Cómo funciona” numbered steps */
export function pastelStepTile14Class(tone: PastelTone): string {
  return `w-14 h-14 rounded-2xl ${GRADIENT_BR[tone]} ${STEP_NUMBER_TEXT[tone]} flex items-center justify-center text-xl font-bold mx-auto`;
}

/** Larger rounded icon holder (partners, etc.) */
export function pastelIconTile14Class(tone: PastelTone): string {
  return `h-14 w-14 rounded-2xl ${GRADIENT_BR[tone]} flex items-center justify-center shrink-0`;
}

/** Animal: estado “en adopción” / in_process */
export const animalAmberStatusBadgeClass =
  'text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 dark:bg-amber-950/35 dark:text-amber-300 dark:ring-amber-700/40 font-medium';

/** Animal: vacunas / esterilizado */
export const animalEmeraldHealthPillClass =
  'text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-700/40';

/** Animal: chip compatibilidad “sí” (el span padre añade ring-1) */
export const animalCompatibilityYesClass =
  'bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-700/40';

/** Animal: bloque necesidades especiales (contenedor) */
export const animalSpecialNeedsCalloutClass =
  'mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 ring-1 ring-amber-200/60 dark:bg-amber-950/25 dark:border-amber-800/40 dark:ring-amber-800/30';

export const animalSpecialNeedsTitleClass = 'text-sm font-medium text-amber-800 dark:text-amber-200';
export const animalSpecialNeedsBodyClass = 'text-sm text-amber-700 dark:text-amber-300/90 mt-1';

/** Animal: fila “casa entrenada” en detalles */
export const animalHouseTrainedRowClass =
  'flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 dark:ring-1 dark:ring-emerald-700/40';
