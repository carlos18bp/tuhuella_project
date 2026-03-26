'use client';

import { Link } from '@/i18n/navigation';

interface HeroCTA {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

interface HeroProps {
  badge?: string;
  title: React.ReactNode;
  subtitle?: string;
  ctas?: HeroCTA[];
  children?: React.ReactNode;
}

const ctaStyles: Record<string, string> = {
  primary: 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md',
  secondary: 'border border-border-secondary text-text-secondary hover:bg-surface-primary shadow-xs hover:shadow-sm',
  accent: 'border border-amber-300 text-amber-700 hover:bg-amber-50 shadow-sm',
};

export default function Hero({ badge, title, subtitle, ctas = [], children }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border-primary bg-gradient-to-b from-stone-50 via-teal-50/30 to-stone-50">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-amber-200/15 blur-3xl pointer-events-none" />
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          {badge && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 shadow-sm ring-1 ring-teal-200/40">
              {badge}
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-text-primary mt-6 leading-[1.1]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-lg text-text-secondary max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
          {ctas.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {ctas.map((cta) => (
                <Link
                  key={cta.href}
                  href={cta.href}
                  className={`rounded-full px-6 py-3 font-medium transition-colors ${ctaStyles[cta.variant ?? 'primary']}`}
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
