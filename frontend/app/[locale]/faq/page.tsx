'use client';

import FAQAccordion from '@/components/ui/FAQAccordion';
import { useAllFAQs } from '@/lib/hooks/useFAQs';

export default function FaqPage() {
  const { topics, loading } = useAllFAQs();

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary heading-decorated-center">Preguntas Frecuentes</h1>
      <p className="mt-2 text-text-tertiary">Resolvemos tus dudas sobre Tu Huella</p>

      {loading ? (
        <div className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-shimmer rounded-xl" />
          ))}
        </div>
      ) : (
        topics.map((topic) => (
          <FAQAccordion key={topic.slug} items={topic.items} title={topic.display_name} />
        ))
      )}
    </div>
  );
}
