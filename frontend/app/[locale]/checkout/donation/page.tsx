'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { CreditCard, Building2, Smartphone, Megaphone } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { Container, FAQAccordion } from '@/components/ui';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { buildDonationCheckoutPayload } from '@/lib/donationCheckoutPayload';

type AmountOption = { id: number; amount: number; label: string };

export default function CheckoutDonacionPage() {
  useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const tCheckout = useTranslations('donationCheckout');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [amountOptions, setAmountOptions] = useState<AmountOption[]>([]);
  const { items: checkoutFaqs } = useFAQsByTopic('checkout');

  const campaignIdFromQuery = useMemo(() => {
    const raw = searchParams.get('campaign');
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const [campaignTitle, setCampaignTitle] = useState<string | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(false);

  useEffect(() => {
    if (campaignIdFromQuery == null) {
      setCampaignTitle(null);
      setCampaignLoading(false);
      return;
    }
    setCampaignLoading(true);
    api
      .get(API_ENDPOINTS.CAMPAIGN_DETAIL(campaignIdFromQuery), {
        params: { lang: locale },
      })
      .then((res) => {
        setCampaignTitle(typeof res.data?.title === 'string' ? res.data.title : null);
      })
      .catch(() => {
        setCampaignTitle(null);
      })
      .finally(() => setCampaignLoading(false));
  }, [campaignIdFromQuery, locale]);

  useEffect(() => {
    api.get(API_ENDPOINTS.DONATION_AMOUNTS)
      .then((res) => {
        setAmountOptions(res.data);
      })
      .catch(() => {
        // Fallback to hardcoded amounts if API fails
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
    const payload = buildDonationCheckoutPayload(
      Number(amount),
      message,
      campaignIdFromQuery,
    );
    // Placeholder — simulate processing; al integrar Wompi: createDonation(payload) luego confirmación
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const q = new URLSearchParams({
      type: 'donation',
      status: 'placeholder',
      dest: payload.destination,
    });
    if (payload.destination === 'campaign' && 'campaign' in payload) {
      q.set('campaign', String(payload.campaign));
    }
    router.push(`${ROUTES.CHECKOUT_CONFIRMATION}?${q.toString()}`);
  };

  return (
    <Container className="py-10 min-w-0">
      <div className="mx-auto max-w-xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary heading-decorated-amber">Donar</h1>
      <p className="mt-2 text-text-tertiary">Tu donación ayuda a refugios y animales que lo necesitan</p>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/25 dark:text-amber-300">
        Pagos en modo placeholder — la integración con Wompi aún no está activa.
      </div>

      {campaignIdFromQuery != null && (
        <div className="mt-4 rounded-xl border border-border-primary bg-surface-secondary/80 p-4 text-sm text-text-secondary">
          <div className="flex items-start gap-2">
            <Megaphone className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="min-w-0">
              <p className="font-medium text-text-primary">{tCheckout('campaignContext')}</p>
              {campaignLoading ? (
                <p className="mt-1 text-text-tertiary">{tCheckout('campaignLoading')}</p>
              ) : (
                <p className="mt-1 text-text-primary truncate">
                  {campaignTitle ?? tCheckout('campaignFallback', { id: campaignIdFromQuery })}
                </p>
              )}
              <Link
                href={ROUTES.CAMPAIGN_DETAIL(campaignIdFromQuery)}
                className="mt-2 inline-block text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline-offset-2 hover:underline"
              >
                {tCheckout('viewCampaign')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {campaignIdFromQuery == null && (
        <p className="mt-4 text-sm text-text-tertiary">{tCheckout('platformContext')}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary">Monto</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {amountOptions.map((opt) => (
              <button key={opt.id} type="button"
                onClick={() => setAmount(String(opt.amount))}
                className={`min-h-11 px-4 py-2 rounded-full text-sm border font-medium btn-base ${
                  amount === String(opt.amount)
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm scale-105 ring-2 ring-offset-1 dark:ring-offset-background'
                    : 'border-border-primary text-text-secondary hover:bg-surface-hover dark:hover:bg-surface-hover'
                }`}>
                ${opt.amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-secondary">Mensaje (opcional)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-border-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] p-3 text-sm text-text-primary placeholder:text-text-quaternary focus:border-amber-500 dark:focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-500/25 outline-none transition-colors bg-surface-primary"
            placeholder="Un mensaje para el refugio..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary">Método de pago</label>
          <div className="mt-2 space-y-2">
            {[
              { value: 'card', label: 'Tarjeta de crédito/débito', icon: CreditCard },
              { value: 'pse', label: 'PSE (transferencia bancaria)', icon: Building2 },
              { value: 'nequi', label: 'Nequi', icon: Smartphone },
            ].map((opt) => (
              <label key={opt.value} className={`flex min-h-11 items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all duration-200 ${
                method === opt.value
                  ? 'border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-500 dark:bg-amber-950/30 dark:border-amber-500/50'
                  : 'border-border-primary hover:bg-surface-hover dark:hover:bg-surface-hover/80'
              }`}>
                <input type="radio" name="method" value={opt.value} checked={method === opt.value}
                  onChange={() => setMethod(opt.value)} className="accent-amber-600" />
                <opt.icon className={`h-4 w-4 ${method === opt.value ? 'text-amber-600' : 'text-text-quaternary'}`} />
                <span className="text-sm text-text-secondary">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting || !amount || Number(amount) <= 0}
          className="w-full min-h-11 inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-sm hover:shadow-md text-white rounded-full py-3 text-sm font-medium btn-base disabled:opacity-50">
          {submitting ? 'Procesando...' : `Donar $${Number(amount || 0).toLocaleString()}`}
        </button>
      </form>

      {checkoutFaqs.length > 0 && (
        <div className="mt-12 border-t border-border-primary pt-2">
          <FAQAccordion
            items={checkoutFaqs}
            title="Preguntas frecuentes"
            subtitle="Sobre donaciones y pagos"
          />
        </div>
      )}
      </div>
    </Container>
  );
}
