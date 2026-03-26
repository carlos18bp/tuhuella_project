'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';

export type SidebarItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  accentColor?: 'teal' | 'amber';
}

export default function Sidebar({ title, items, accentColor = 'teal' }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const accent = accentColor === 'amber'
    ? { active: 'bg-amber-50 text-amber-700 border-amber-500', hover: 'hover:bg-amber-50/60 hover:text-amber-700', toggle: 'bg-amber-600 hover:bg-amber-700' }
    : { active: 'bg-teal-50 text-teal-700 border-teal-500', hover: 'hover:bg-teal-50/60 hover:text-teal-700', toggle: 'bg-teal-600 hover:bg-teal-700' };

  const isActive = (href: string) => pathname === href;

  const navContent = (
    <nav className="flex flex-col gap-1" role="navigation" aria-label={title}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors border-l-2 ${
            isActive(item.href)
              ? accent.active
              : `border-transparent text-text-secondary ${accent.hover}`
          }`}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white ${accent.toggle} transition-colors`}
          aria-label="Toggle sidebar"
          aria-expanded={mobileOpen}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          {title}
        </button>
        {mobileOpen && (
          <div className="mt-2 rounded-2xl border border-border-primary bg-surface-primary p-3 shadow-lg">
            {navContent}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 rounded-2xl border border-border-primary bg-surface-primary p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-quaternary px-4 mb-3">
            {title}
          </h2>
          {navContent}
        </div>
      </aside>
    </>
  );
}
