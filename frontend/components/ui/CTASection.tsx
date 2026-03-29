'use client';

import { Link } from '@/i18n/navigation';
import Container from './Container';

interface CTASectionProps {
  title: string;
  subtitle?: string;
  linkHref: string;
  linkLabel: string;
  linkColor?: string;
  decorated?: boolean;
  children: React.ReactNode;
}

export default function CTASection({
  title,
  subtitle,
  linkHref,
  linkLabel,
  linkColor = 'text-teal-600 hover:text-teal-700',
  decorated = false,
  children,
}: CTASectionProps) {
  return (
    <Container>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
        <div>
          <h2 className={`text-2xl font-bold text-text-primary${decorated ? ' heading-decorated' : ''}`}>{title}</h2>
          {subtitle && <p className="mt-1 text-text-tertiary">{subtitle}</p>}
        </div>
        <Link href={linkHref} className={`text-sm font-medium ${linkColor}`}>
          {linkLabel} &rarr;
        </Link>
      </div>
      {children}
    </Container>
  );
}
