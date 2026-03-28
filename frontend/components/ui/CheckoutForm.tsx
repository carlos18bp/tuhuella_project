'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import TermsModal from './TermsModal';

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
    accent: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-sm hover:shadow-md',
    hoverAccent: '',
    borderAccent: 'border-amber-600',
    selectedAccent: 'border-amber-500 bg-amber-50 ring-2 ring-offset-1 ring-amber-500',
    radioAccent: 'accent-amber-600',
    focusAccent: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10',
    submitLabel: (amount) => `Donar $${amount.toLocaleString()}`,
  },
  sponsorship: {
    accent: 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md',
    hoverAccent: '',
    borderAccent: 'border-teal-600',
    selectedAccent: 'border-teal-500 bg-teal-50 ring-2 ring-offset-1 ring-teal-500',
    radioAccent: 'accent-teal-600',
    focusAccent: 'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10',
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
  const tTerms = useTranslations('termsAcceptance');

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [message, setMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const config = typeConfig[type];
  const numericAmount = Number(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0 || !termsAccepted) return;
    void onSubmit({ amount: numericAmount, method, message });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Recipient info */}
      <div className="rounded-2xl border border-border-primary bg-surface-secondary/50 p-4">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wider">
          {type === 'donation' ? 'Donación para' : 'Apadrinamiento de'}
        </p>
        <p className="text-base font-semibold text-text-primary mt-0.5">{recipientName}</p>
      </div>

      {/* Amount selection */}
      <div>
        <label className="block text-sm font-medium tracking-[-0.01em] text-text-secondary">Monto</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                amount === String(preset)
                  ? `${config.accent} text-white ${config.borderAccent}`
                  : 'border-border-primary text-text-secondary hover:bg-surface-hover'
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
          className={`mt-3 w-full rounded-xl border border-border-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] p-3 text-sm text-text-primary ${config.focusAccent} outline-none`}
        />
      </div>

      {/* Payment method */}
      <div>
        <label className="block text-sm font-medium tracking-[-0.01em] text-text-secondary">Método de pago</label>
        <div className="mt-2 space-y-2">
          {PAYMENT_METHODS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                method === opt.value ? config.selectedAccent : 'border-border-primary hover:bg-surface-hover hover:border-border-secondary hover:shadow-sm'
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
              <span className="text-sm text-text-secondary">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="checkout-message" className="block text-sm font-medium tracking-[-0.01em] text-text-secondary">
          Mensaje (opcional)
        </label>
        <textarea
          id="checkout-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className={`mt-1 w-full rounded-xl border border-border-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] p-3 text-sm text-text-primary ${config.focusAccent} outline-none`}
          placeholder="Un mensaje para el refugio..."
        />
      </div>

      {/* Summary + Submit */}
      {numericAmount > 0 && (
        <div className="rounded-2xl border border-border-primary bg-gradient-to-r from-surface-secondary to-surface-primary p-4 flex items-center justify-between">
          <span className="text-sm text-text-tertiary">Total</span>
          <span className="text-lg font-bold text-text-primary">${numericAmount.toLocaleString()}</span>
        </div>
      )}

      {/* Terms acceptance */}
      <div className="flex items-start gap-2.5">
        <input
          id="checkout-terms"
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border-primary text-teal-600 accent-teal-600 cursor-pointer"
        />
        <label htmlFor="checkout-terms" className="text-xs text-text-tertiary leading-snug cursor-pointer">
          {tTerms('checkoutLabel')}{' '}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="text-teal-600 font-medium hover:text-teal-700 underline underline-offset-2 transition-colors"
          >
            {tTerms('termsLink')}
          </button>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting || numericAmount <= 0 || !termsAccepted}
        className={`w-full ${config.accent} text-white rounded-full py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {submitting ? 'Procesando...' : config.submitLabel(numericAmount)}
      </button>

      <TermsModal
        open={showTermsModal}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
        }}
        onClose={() => setShowTermsModal(false)}
        showActions={true}
      />
    </form>
  );
}
