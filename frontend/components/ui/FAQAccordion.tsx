'use client';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="space-y-6">
      {items.map((faq, i) => (
        <div key={i} className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="font-semibold text-stone-800">{faq.question}</h3>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}
