'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { CreditCard, Building2, Smartphone } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { FAQAccordion } from '@/components/ui';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';

type AmountOption = { id: number; amount: number; label: string };

export default function CheckoutApadrinamientoPage() {
  useRequireAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'one_time'>('monthly');
  const [method, setMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [amountOptions, setAmountOptions] = useState<AmountOption[]>([]);
  const { items: checkoutFaqs } = useFAQsByTopic('checkout');

  useEffect(() => {
    api.get(API_ENDPOINTS.SPONSORSHIP_AMOUNTS)
      .then((res) => {
        setAmountOptions(res.data);
      })
      .catch(() => {
        setAmountOptions([
          { id: 1, amount: 15000, label: '' },
          { id: 2, amount: 30000, label: '' },
          { id: 3, amount: 50000, label: '' },
          { id: 4, amount: 75000, label: '' },
          { id: 5, amount: 200000, label: '' },
        ]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    // Placeholder — simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(ROUTES.CHECKOUT_CONFIRMATION + '?type=sponsorship&status=placeholder');
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary heading-decorated">Apadrinar</h1>
      <p className="mt-2 text-text-tertiary">Apadrina un animal y apoya su cuidado continuo</p>

      <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-700">
        Pagos en modo placeholder — la integración con Wompi aún no está activa.
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary">Frecuencia</label>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setFrequency('monthly')}
              className={`px-4 py-2.5 rounded-full text-sm border font-medium btn-base ${
                frequency === 'monthly' ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-offset-1' : 'border-border-primary text-text-secondary hover:bg-surface-hover'
              }`}>
              Mensual
            </button>
            <button type="button" onClick={() => setFrequency('one_time')}
              className={`px-4 py-2.5 rounded-full text-sm border font-medium btn-base ${
                frequency === 'one_time' ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-offset-1' : 'border-border-primary text-text-secondary hover:bg-surface-hover'
              }`}>
              Pago único
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary">Monto</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {amountOptions.map((opt) => (
              <button key={opt.id} type="button"
                onClick={() => setAmount(String(opt.amount))}
                className={`px-4 py-2.5 rounded-full text-sm border font-medium btn-base ${
                  amount === String(opt.amount)
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm scale-105 ring-2 ring-offset-1'
                    : 'border-border-primary text-text-secondary hover:bg-surface-hover'
                }`}>
                ${opt.amount.toLocaleString()}{frequency === 'monthly' ? '/mes' : ''}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary">Método de pago</label>
          <div className="mt-2 space-y-2">
            {[
              { value: 'card', label: 'Tarjeta de crédito/débito', icon: CreditCard },
              { value: 'pse', label: 'PSE (transferencia bancaria)', icon: Building2 },
              { value: 'nequi', label: 'Nequi', icon: Smartphone },
            ].map((opt) => (
              <label key={opt.value} className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all duration-200 ${
                method === opt.value ? 'border-teal-500 bg-teal-50 shadow-sm ring-1 ring-teal-500' : 'border-border-primary hover:bg-surface-hover'
              }`}>
                <input type="radio" name="method" value={opt.value} checked={method === opt.value}
                  onChange={() => setMethod(opt.value)} className="accent-teal-600" />
                <opt.icon className={`h-4 w-4 ${method === opt.value ? 'text-teal-600' : 'text-text-quaternary'}`} />
                <span className="text-sm text-text-secondary">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting || !amount || Number(amount) <= 0}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md text-white rounded-full py-3 text-sm font-medium btn-base disabled:opacity-50">
          {submitting ? 'Procesando...' : `Apadrinar — $${Number(amount || 0).toLocaleString()}${frequency === 'monthly' ? '/mes' : ''}`}
        </button>
      </form>

      {checkoutFaqs.length > 0 && (
        <div className="mt-12 border-t border-border-primary pt-2">
          <FAQAccordion
            items={checkoutFaqs}
            title="Preguntas frecuentes"
            subtitle="Sobre apadrinamiento y pagos"
          />
        </div>
      )}
    </div>
  );
}
