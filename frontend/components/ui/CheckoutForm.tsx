'use client';

import { useState } from 'react';

export type CheckoutType = 'donation' | 'sponsorship';

export type CheckoutFormData = {
  amount: number;
  method: string;
  message: string;
};

interface CheckoutFormProps {
  type: CheckoutType;
  recipientName: string;
  presetAmounts?: number[];
  onSubmit: (data: CheckoutFormData) => void | Promise<void>;
  submitting?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'card', label: 'Tarjeta de crédito/débito' },
  { value: 'pse', label: 'PSE (transferencia bancaria)' },
  { value: 'nequi', label: 'Nequi' },
];

const typeConfig: Record<CheckoutType, { accent: string; hoverAccent: string; borderAccent: string; selectedAccent: string; radioAccent: string; focusAccent: string; submitLabel: (amount: number) => string }> = {
  donation: {
    accent: 'bg-amber-600',
    hoverAccent: 'hover:bg-amber-700',
    borderAccent: 'border-amber-600',
    selectedAccent: 'border-amber-500 bg-amber-50',
    radioAccent: 'accent-amber-600',
    focusAccent: 'focus:border-amber-500 focus:ring-amber-500',
    submitLabel: (amount) => `Donar $${amount.toLocaleString()}`,
  },
  sponsorship: {
    accent: 'bg-teal-600',
    hoverAccent: 'hover:bg-teal-700',
    borderAccent: 'border-teal-600',
    selectedAccent: 'border-teal-500 bg-teal-50',
    radioAccent: 'accent-teal-600',
    focusAccent: 'focus:border-teal-500 focus:ring-teal-500',
    submitLabel: (amount) => `Apadrinar $${amount.toLocaleString()}/mes`,
  },
};

export default function CheckoutForm({
  type,
  recipientName,
  presetAmounts = [10000, 25000, 50000, 100000],
  onSubmit,
  submitting = false,
}: CheckoutFormProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [message, setMessage] = useState('');

  const config = typeConfig[type];
  const numericAmount = Number(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;
    void onSubmit({ amount: numericAmount, method, message });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Recipient info */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">
          {type === 'donation' ? 'Donación para' : 'Apadrinamiento de'}
        </p>
        <p className="text-base font-semibold text-stone-800 mt-0.5">{recipientName}</p>
      </div>

      {/* Amount selection */}
      <div>
        <label className="block text-sm font-medium text-stone-700">Monto</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                amount === String(preset)
                  ? `${config.accent} text-white ${config.borderAccent}`
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
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
          className={`mt-3 w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-800 ${config.focusAccent} outline-none`}
        />
      </div>

      {/* Payment method */}
      <div>
        <label className="block text-sm font-medium text-stone-700">Método de pago</label>
        <div className="mt-2 space-y-2">
          {PAYMENT_METHODS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                method === opt.value ? config.selectedAccent : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <input
                type="radio"
                name="checkout-method"
                value={opt.value}
                checked={method === opt.value}
                onChange={() => setMethod(opt.value)}
                className={config.radioAccent}
              />
              <span className="text-sm text-stone-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="checkout-message" className="block text-sm font-medium text-stone-700">
          Mensaje (opcional)
        </label>
        <textarea
          id="checkout-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className={`mt-1 w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-800 ${config.focusAccent} outline-none`}
          placeholder="Un mensaje para el refugio..."
        />
      </div>

      {/* Summary + Submit */}
      {numericAmount > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center justify-between">
          <span className="text-sm text-stone-500">Total</span>
          <span className="text-lg font-bold text-stone-800">${numericAmount.toLocaleString()}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || numericAmount <= 0}
        className={`w-full ${config.accent} text-white rounded-full py-3 text-sm font-medium ${config.hoverAccent} transition-colors disabled:opacity-50`}
      >
        {submitting ? 'Procesando...' : config.submitLabel(numericAmount)}
      </button>
    </form>
  );
}
