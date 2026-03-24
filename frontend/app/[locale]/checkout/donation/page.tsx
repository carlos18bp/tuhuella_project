'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { CreditCard, Building2, Smartphone } from 'lucide-react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { ROUTES } from '@/lib/constants';

export default function CheckoutDonacionPage() {
  useRequireAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);

  const presetAmounts = [10000, 25000, 50000, 100000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    // Placeholder — simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(ROUTES.CHECKOUT_CONFIRMATION + '?type=donation&status=placeholder');
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Donar</h1>
      <p className="mt-2 text-stone-500">Tu donación ayuda a refugios y animales que lo necesitan</p>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        Pagos en modo placeholder — la integración con Wompi aún no está activa.
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700">Monto</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <button key={preset} type="button"
                onClick={() => setAmount(String(preset))}
                className={`px-4 py-2.5 rounded-full text-sm border font-medium btn-base ${
                  amount === String(preset)
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm scale-105'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}>
                ${preset.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Otro monto"
            min="1"
            className="mt-3 w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-stone-700">Mensaje (opcional)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-colors"
            placeholder="Un mensaje para el refugio..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Método de pago</label>
          <div className="mt-2 space-y-2">
            {[
              { value: 'card', label: 'Tarjeta de crédito/débito', icon: CreditCard },
              { value: 'pse', label: 'PSE (transferencia bancaria)', icon: Building2 },
              { value: 'nequi', label: 'Nequi', icon: Smartphone },
            ].map((opt) => (
              <label key={opt.value} className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all duration-200 ${
                method === opt.value ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-stone-200 hover:bg-stone-50'
              }`}>
                <input type="radio" name="method" value={opt.value} checked={method === opt.value}
                  onChange={() => setMethod(opt.value)} className="accent-amber-600" />
                <opt.icon className={`h-4 w-4 ${method === opt.value ? 'text-amber-600' : 'text-stone-400'}`} />
                <span className="text-sm text-stone-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting || !amount || Number(amount) <= 0}
          className="w-full bg-amber-600 text-white rounded-full py-3 text-sm font-medium hover:bg-amber-700 btn-base shadow-sm disabled:opacity-50">
          {submitting ? 'Procesando...' : `Donar $${Number(amount || 0).toLocaleString()}`}
        </button>
      </form>
    </div>
  );
}
