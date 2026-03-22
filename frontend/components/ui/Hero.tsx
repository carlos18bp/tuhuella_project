'use client';

import Link from 'next/link';

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
  primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm',
  secondary: 'border border-stone-300 text-stone-700 hover:bg-white shadow-sm',
  accent: 'border border-amber-300 text-amber-700 hover:bg-amber-50 shadow-sm',
};

export default function Hero({ badge, title, subtitle, ctas = [], children }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-stone-50 via-teal-50/30 to-stone-50">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          {badge && (
            <p className="inline-flex items-center text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
              {badge}
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 mt-6 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-lg text-stone-600 max-w-2xl leading-relaxed">
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
