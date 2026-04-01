'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants';
import { Container, FAQAccordion } from '@/components/ui';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { useAuthStore } from '@/lib/stores/authStore';

export default function BuscoAdoptarPage() {
  const t = useTranslations('lookingToAdopt');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { items: buscoAdoptarFaqs } = useFAQsByTopic('looking-to-adopt');

  return (
    <Container className="py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary heading-decorated">{t('title')}</h1>
      <p className="mt-2 text-text-tertiary max-w-2xl">
        {t('subtitle')}
      </p>

      <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="rounded-2xl border border-border-primary bg-surface-primary p-5 md:p-8">
          <h2 className="text-lg font-semibold text-text-primary">{t('howItWorks')}</h2>
          <ul className="mt-4 space-y-3 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="text-teal-600 dark:text-teal-400 font-bold">1.</span>
              {t('step1')}
            </li>
            <li className="flex gap-3">
              <span className="text-teal-600 dark:text-teal-400 font-bold">2.</span>
              {t('step2')}
            </li>
            <li className="flex gap-3">
              <span className="text-teal-600 dark:text-teal-400 font-bold">3.</span>
              {t('step3')}
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 md:p-8 dark:border-teal-500/25 dark:bg-teal-950/30">
          <h2 className="text-lg font-semibold text-teal-800 dark:text-teal-200">{t('publishIntent')}</h2>
          <p className="mt-2 text-sm text-teal-700 dark:text-teal-300/90">
            {isAuthenticated ? t('publishDescriptionAuth') : t('publishDescriptionGuest')}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
            {isAuthenticated ? (
              <Link
                href={ROUTES.MY_INTENT}
                className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
              >
                {t('myIntent')}
              </Link>
            ) : (
              <Link
                href={ROUTES.SIGN_IN}
                className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
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
    </Container>
  );
}
