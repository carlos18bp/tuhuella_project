'use client';

import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';

type WhatsAppContactCardProps = {
  phone: string;
  contactName: string;
  intro: string;
  buttonLabel: string;
  prefilledMessage?: string;
};

const sanitizeDigits = (raw: string): string => raw.replace(/[^\d]/g, '');

export default function WhatsAppContactCard({
  phone,
  contactName,
  intro,
  buttonLabel,
  prefilledMessage,
}: WhatsAppContactCardProps) {
  const t = useTranslations('adoption.contact');
  const digits = sanitizeDigits(phone);
  if (!digits) return null;

  const params = new URLSearchParams();
  if (prefilledMessage) params.set('text', prefilledMessage);
  const query = params.toString();
  const href = `https://wa.me/${digits}${query ? `?${query}` : ''}`;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-emerald-900">{t('cardTitle')}</h3>
          <p className="mt-1 text-sm text-emerald-900/80 leading-relaxed">{intro}</p>
          <p className="mt-2 text-sm font-medium text-emerald-900">{contactName}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
            data-testid="whatsapp-contact-cta"
          >
            <MessageCircle className="h-4 w-4" />
            {buttonLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
