'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants';
import { FAQAccordion } from '@/components/ui';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { useAuthStore } from '@/lib/stores/authStore';

export default function BuscoAdoptarPage() {
  const t = useTranslations('lookingToAdopt');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { items: buscoAdoptarFaqs } = useFAQsByTopic('looking-to-adopt');

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary heading-decorated">{t('title')}</h1>
      <p className="mt-2 text-text-tertiary max-w-2xl">
        {t('subtitle')}
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-border-primary bg-surface-primary p-8">
          <h2 className="text-lg font-semibold text-text-primary">{t('howItWorks')}</h2>
          <ul className="mt-4 space-y-3 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="text-teal-600 font-bold">1.</span>
              {t('step1')}
            </li>
            <li className="flex gap-3">
              <span className="text-teal-600 font-bold">2.</span>
              {t('step2')}
            </li>
            <li className="flex gap-3">
              <span className="text-teal-600 font-bold">3.</span>
              {t('step3')}
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-8">
          <h2 className="text-lg font-semibold text-teal-800">{t('publishIntent')}</h2>
          <p className="mt-2 text-sm text-teal-700">
            {isAuthenticated ? t('publishDescriptionAuth') : t('publishDescriptionGuest')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <Link
                href={ROUTES.MY_INTENT}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
              >
                {t('myIntent')}
              </Link>
            ) : (
              <Link
                href={ROUTES.SIGN_IN}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
              >
                {t('signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {buscoAdoptarFaqs.length > 0 && (
        <FAQAccordion
          items={buscoAdoptarFaqs}
          title={t('faqTitle')}
          subtitle={t('faqSubtitle')}
        />
      )}
    </div>
  );
}
