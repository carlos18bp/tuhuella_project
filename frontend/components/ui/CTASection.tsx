'use client';

import { Link } from '@/i18n/navigation';

interface CTASectionProps {
  title: string;
  subtitle?: string;
  linkHref: string;
  linkLabel: string;
  linkColor?: string;
  children: React.ReactNode;
}

export default function CTASection({
  title,
  subtitle,
  linkHref,
  linkLabel,
  linkColor = 'text-teal-600 hover:text-teal-700',
  children,
}: CTASectionProps) {
  return (
    <div className="mx-auto max-w-[1400px] px-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">{title}</h2>
          {subtitle && <p className="mt-1 text-stone-500">{subtitle}</p>}
        </div>
        <Link href={linkHref} className={`text-sm font-medium ${linkColor}`}>
          {linkLabel} &rarr;
        </Link>
      </div>
      {children}
    </div>
  );
}
