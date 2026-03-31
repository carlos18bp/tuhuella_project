/**
 * Shared pill/badge Tailwind classes for shelter admin panel
 * (animals, campaigns, applications lists + dashboard verification).
 */

export const shelterPillNeutralSecondary =
  'bg-surface-tertiary text-text-secondary dark:ring-1 dark:ring-border-primary';

export const shelterPillNeutralTertiary =
  'bg-surface-tertiary text-text-tertiary dark:ring-1 dark:ring-border-primary';

export const shelterPillTeal =
  'bg-teal-50 text-teal-700 dark:bg-teal-950/35 dark:text-teal-300 ring-1 ring-teal-200/60 dark:ring-teal-700/40';

export const shelterPillAmber =
  'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300 ring-1 ring-amber-200/60 dark:ring-amber-700/40';

export const shelterPillEmerald =
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300 ring-1 ring-emerald-200/60 dark:ring-emerald-700/40';

export const shelterPillRed =
  'bg-red-50 text-red-700 dark:bg-red-950/25 dark:text-red-300 ring-1 ring-red-200/60 dark:ring-red-800/40';

/** Scheduled / info (e.g. blog calendar "programado"). */
export const shelterPillBlue =
  'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300 ring-1 ring-blue-200/60 dark:ring-blue-700/40';

export type ShelterVerificationStatus = 'verified' | 'pending' | 'rejected' | string;

export function shelterVerificationPillClass(status: ShelterVerificationStatus): string {
  if (status === 'verified') return shelterPillEmerald;
  if (status === 'pending') return shelterPillAmber;
  return shelterPillRed;
}
