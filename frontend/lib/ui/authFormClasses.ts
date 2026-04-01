/**
 * Shared Tailwind classes for email/password fields on sign-in, sign-up, and forgot-password.
 */

export const authInputFieldClass =
  'border border-border-primary rounded-xl px-3.5 py-2.5 w-full bg-surface-primary text-text-primary placeholder:text-text-quaternary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] dark:shadow-none focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-500/60 dark:focus:ring-teal-500/20 transition-colors';

/** 6-digit code field on forgot-password step 2 */
export const authInputCodeClass =
  'border border-border-primary rounded-xl px-3.5 py-3 w-full bg-surface-primary text-text-primary text-center text-2xl tracking-widest placeholder:text-stone-300 dark:placeholder:text-stone-600 shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] dark:shadow-none focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-500/60 dark:focus:ring-teal-500/20 transition-colors';
