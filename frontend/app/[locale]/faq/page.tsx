'use client';

import { useTranslations } from 'next-intl';

import { Container } from '@/components/ui';
import FAQAccordion from '@/components/ui/FAQAccordion';
import { useAllFAQs } from '@/lib/hooks/useFAQs';

export default function FaqPage() {
  const t = useTranslations('faqPage');
  const { topics, loading } = useAllFAQs();

  return (
    <>
      <section className="border-b border-border-primary bg-gradient-to-b from-surface-secondary to-background">
        <Container className="py-10 md:py-12 text-center">
          <h1 className="text-3xl font-bold text-text-primary heading-decorated-center">{t('title')}</h1>
          <p className="mt-2 text-text-tertiary max-w-2xl mx-auto">{t('subtitle')}</p>
        </Container>
      </section>

      {loading ? (
        <Container className="py-10">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-shimmer rounded-xl" />
            ))}
          </div>
        </Container>
      ) : (
        topics.map((topic) => (
          <FAQAccordion key={topic.slug} items={topic.items} title={topic.display_name} />
        ))
      )}
    </>
  );
}
