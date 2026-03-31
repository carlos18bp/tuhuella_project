'use client';

/** Message box classes for staff/admin-only views (shared across admin routes). */
export const ADMIN_ACCESS_DENIED_MESSAGE_CLASS =
  'text-red-600 dark:text-red-300 font-medium rounded-xl border border-red-200/60 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20 px-4 py-3';

type AdminAccessDeniedProps = {
  children: React.ReactNode;
  maxWidthClass?: string;
  className?: string;
};

export default function AdminAccessDenied({
  children,
  maxWidthClass = 'max-w-[1400px]',
  className = '',
}: AdminAccessDeniedProps) {
  return (
    <div
      className={`mx-auto ${maxWidthClass} px-6 py-10 min-w-0 overflow-x-hidden ${className}`.trim()}
    >
      <p className={ADMIN_ACCESS_DENIED_MESSAGE_CLASS}>{children}</p>
    </div>
  );
}
