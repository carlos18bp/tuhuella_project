'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { ROUTES } from '@/lib/constants';

export default function CheckoutApadrinamientoPage() {
  useRequireAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'one_time'>('monthly');
  const [method, setMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);

  const presetAmounts = [15000, 30000, 50000, 75000];

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
      <h1 className="text-3xl font-bold text-stone-800">Apadrinar</h1>
      <p className="mt-2 text-stone-500">Apadrina un animal y apoya su cuidado continuo</p>

      <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-700">
        Pagos en modo placeholder — la integración con Wompi aún no está activa.
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700">Frecuencia</label>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setFrequency('monthly')}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                frequency === 'monthly' ? 'bg-teal-600 text-white border-teal-600' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}>
              Mensual
            </button>
            <button type="button" onClick={() => setFrequency('one_time')}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                frequency === 'one_time' ? 'bg-teal-600 text-white border-teal-600' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}>
              Pago único
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Monto</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <button key={preset} type="button"
                onClick={() => setAmount(String(preset))}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  amount === String(preset)
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}>
                ${preset.toLocaleString()}{frequency === 'monthly' ? '/mes' : ''}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Otro monto"
            min="1"
            className="mt-3 w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Método de pago</label>
          <div className="mt-2 space-y-2">
            {[
              { value: 'card', label: 'Tarjeta de crédito/débito' },
              { value: 'pse', label: 'PSE (transferencia bancaria)' },
              { value: 'nequi', label: 'Nequi' },
            ].map((opt) => (
              <label key={opt.value} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                method === opt.value ? 'border-teal-500 bg-teal-50' : 'border-stone-200 hover:bg-stone-50'
              }`}>
                <input type="radio" name="method" value={opt.value} checked={method === opt.value}
                  onChange={() => setMethod(opt.value)} className="accent-teal-600" />
                <span className="text-sm text-stone-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting || !amount || Number(amount) <= 0}
          className="w-full bg-teal-600 text-white rounded-full py-3 text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
          {submitting ? 'Procesando...' : `Apadrinar — $${Number(amount || 0).toLocaleString()}${frequency === 'monthly' ? '/mes' : ''}`}
        </button>
      </form>
    </div>
  );
}
