'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
}

function AccordionItem({ faq }: { faq: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between p-5 text-left transition-colors ${open ? 'bg-stone-50/50' : 'hover:bg-stone-50'}`}
      >
        <h3 className="font-semibold text-stone-800 pr-4">{faq.question}</h3>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm text-stone-600 leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQAccordion({ items, title, subtitle }: FAQAccordionProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-6">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-stone-800">{title}</h2>
            {subtitle && <p className="mt-2 text-stone-500">{subtitle}</p>}
          </div>
        )}
        <div className="space-y-3">
          {items.map((faq, i) => (
            <AccordionItem key={i} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
