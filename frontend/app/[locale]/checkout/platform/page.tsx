'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { CreditCard, Building2, Smartphone, Sparkles } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { Container, FAQAccordion } from '@/components/ui';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';

type AmountOption = { id: number; amount: number; label: string };

export default function CheckoutPlatformPage() {
  useRequireAuth();
  const router = useRouter();
  const t = useTranslations('platformCheckout');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [amountOptions, setAmountOptions] = useState<AmountOption[]>([]);
  const { items: faqs } = useFAQsByTopic('apoyo-plataforma');

  useEffect(() => {
    api
      .get(API_ENDPOINTS.DONATION_AMOUNTS)
      .then((res) => {
        setAmountOptions(res.data);
      })
      .catch(() => {
        setAmountOptions([
          { id: 1, amount: 10000, label: '' },
          { id: 2, amount: 25000, label: '' },
          { id: 3, amount: 50000, label: '' },
          { id: 4, amount: 100000, label: '' },
          { id: 5, amount: 200000, label: '' },
        ]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const q = new URLSearchParams({
      type: 'donation',
      status: 'placeholder',
      dest: 'platform',
    });
    router.push(`${ROUTES.CHECKOUT_CONFIRMATION}?${q.toString()}`);
  };

  const amountNumber = Number(amount || 0);
  const formattedAmount = amountNumber.toLocaleString();

  return (
    <Container className="py-10 min-w-0">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('title')}</h1>
        <p className="mt-2 text-text-tertiary">{t('subtitle')}</p>

        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/25 dark:text-rose-300">
          {t('placeholderNotice')}
        </div>

        <div className="mt-4 rounded-xl border border-border-primary bg-surface-secondary/80 p-4 text-sm text-text-secondary">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="min-w-0">
              <p className="font-medium text-text-primary">{t('contextTitle')}</p>
              <p className="mt-1 text-text-tertiary">{t('contextBody')}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary">
              {t('amountLabel')}
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {amountOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAmount(String(opt.amount))}
                  className={`min-h-11 px-4 py-2 rounded-full text-sm border font-medium btn-base ${
                    amount === String(opt.amount)
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm scale-105 ring-2 ring-offset-1 dark:ring-offset-background'
                      : 'border-border-primary text-text-secondary hover:bg-surface-hover dark:hover:bg-surface-hover'
                  }`}
                >
                  ${opt.amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-text-secondary"
            >
              {t('messageLabel')}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-border-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] p-3 text-sm text-text-primary placeholder:text-text-quaternary focus:border-rose-500 dark:focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-rose-500/25 outline-none transition-colors bg-surface-primary"
              placeholder={t('messagePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary">
              {t('methodLabel')}
            </label>
            <div className="mt-2 space-y-2">
              {[
                { value: 'card', label: t('methodCard'), icon: CreditCard },
                { value: 'pse', label: t('methodPse'), icon: Building2 },
                { value: 'nequi', label: t('methodNequi'), icon: Smartphone },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex min-h-11 items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all duration-200 ${
                    method === opt.value
                      ? 'border-rose-500 bg-rose-50 shadow-sm ring-1 ring-rose-500 dark:bg-rose-950/30 dark:border-rose-500/50'
                      : 'border-border-primary hover:bg-surface-hover dark:hover:bg-surface-hover/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={opt.value}
                    checked={method === opt.value}
                    onChange={() => setMethod(opt.value)}
                    className="accent-rose-600"
                  />
                  <opt.icon
                    className={`h-4 w-4 ${
                      method === opt.value ? 'text-rose-600' : 'text-text-quaternary'
                    }`}
                  />
                  <span className="text-sm text-text-secondary">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !amount || amountNumber <= 0}
            className="w-full min-h-11 inline-flex items-center justify-center bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-sm hover:shadow-md text-white rounded-full py-3 text-sm font-medium btn-base disabled:opacity-50"
          >
            {submitting
              ? t('submitting')
              : t('submit', { amount: formattedAmount })}
          </button>
        </form>

        {faqs.length > 0 && (
          <div className="mt-12 border-t border-border-primary pt-2">
            <FAQAccordion items={faqs} title={t('faqTitle')} subtitle={t('faqSubtitle')} />
          </div>
        )}
      </div>
    </Container>
  );
}
