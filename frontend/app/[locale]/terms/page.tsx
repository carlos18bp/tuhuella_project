'use client';

import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('terms');

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
      <h1 className="text-3xl font-bold text-stone-800">{t('title')}</h1>
      <p className="mt-2 text-sm text-stone-400">
        {t('lastUpdated')}: 2026-03-25
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-lg font-semibold text-stone-800">{section.title}</h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
