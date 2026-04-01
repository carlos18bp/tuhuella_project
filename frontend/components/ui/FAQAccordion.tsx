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
    <div
      className={`rounded-xl border border-border-primary bg-surface-primary overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${
        open ? 'border-l-2 border-l-teal-500 dark:border-l-teal-400' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full min-h-11 items-center justify-between gap-3 p-5 text-left transition-colors ${
          open ? 'bg-surface-secondary/50' : 'hover:bg-surface-hover'
        }`}
      >
        <h3 className="font-semibold text-text-primary pr-2 min-w-0 flex-1 break-words">{faq.question}</h3>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-teal-500' : 'text-text-quaternary'
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm text-text-secondary leading-[1.7]">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQAccordion({ items, title, subtitle }: FAQAccordionProps) {
  return (
    <section className="py-10 md:py-12">
      <div className="mx-auto max-w-3xl px-6">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
            {subtitle && <p className="mt-2 text-text-tertiary">{subtitle}</p>}
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
