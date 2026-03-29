'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen } from 'lucide-react';

import { TermsModal } from '@/components/ui';

export default function TermsPage() {
  const t = useTranslations('terms');
  const tModal = useTranslations('termsModal');
  const [showModal, setShowModal] = useState(false);

  const sections = [
    { title: t('generalTitle'), content: t('generalContent') },
    { title: t('userTitle'), content: t('userContent') },
    { title: t('adoptionTitle'), content: t('adoptionContent') },
    { title: t('donationTitle'), content: t('donationContent') },
    { title: t('privacyTitle'), content: t('privacyContent') },
    { title: t('shelterTitle'), content: t('shelterContent') },
    { title: t('contentTitle'), content: t('contentContent') },
    { title: t('liabilityTitle'), content: t('liabilityContent') },
    { title: t('changesTitle'), content: t('changesContent') },
    { title: t('contactTitle'), content: t('contactContent') },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('title')}</h1>
          <p className="mt-2 text-sm text-text-quaternary">
            {t('lastUpdated')}: 2026-03-25
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="shrink-0 self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          {tModal('title')}
        </button>
      </div>

      <div className="mt-10 space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-lg font-semibold text-text-primary">{section.title}</h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      <TermsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        showActions={false}
      />
    </div>
  );
}
