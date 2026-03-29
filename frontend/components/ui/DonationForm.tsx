'use client';

import { useState } from 'react';

interface DonationFormProps {
  presetAmounts?: number[];
  accentColor?: 'amber' | 'teal';
  onSubmit: (data: { amount: number; message: string; method: string }) => void | Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
}

export default function DonationForm({
  presetAmounts = [10000, 25000, 50000, 100000],
  accentColor = 'amber',
  onSubmit,
  submitting = false,
  submitLabel,
}: DonationFormProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState('card');

  const methods = [
    { value: 'card', label: 'Tarjeta de crédito/débito' },
    { value: 'pse', label: 'PSE (transferencia bancaria)' },
    { value: 'nequi', label: 'Nequi' },
  ];

  const accent = accentColor === 'teal'
    ? { bg: 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow-md', hover: '', border: 'border-teal-600', selected: 'border-teal-500 bg-teal-50 ring-2 ring-offset-1 ring-teal-500', radio: 'accent-teal-600', focus: 'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10' }
    : { bg: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-sm hover:shadow-md', hover: '', border: 'border-amber-600', selected: 'border-amber-500 bg-amber-50 ring-2 ring-offset-1 ring-amber-500', radio: 'accent-amber-600', focus: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10' };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    void onSubmit({ amount: Number(amount), message, method });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                  ? `${accent.bg} text-white ${accent.border}`
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
          className={`mt-3 w-full rounded-xl border border-border-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] p-3 text-sm text-text-primary ${accent.focus} outline-none`}
        />
      </div>

      <div>
        <label htmlFor="donation-message" className="block text-sm font-medium tracking-[-0.01em] text-text-secondary">Mensaje (opcional)</label>
        <textarea
          id="donation-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className={`mt-1 w-full rounded-xl border border-border-primary shadow-[inset_0_1px_2px_rgb(0,0,0,0.04)] p-3 text-sm text-text-primary ${accent.focus} outline-none`}
          placeholder="Un mensaje para el refugio..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium tracking-[-0.01em] text-text-secondary">Método de pago</label>
        <div className="mt-2 space-y-2">
          {methods.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                method === opt.value ? accent.selected : 'border-border-primary hover:bg-surface-hover'
              }`}
            >
              <input
                type="radio"
                name="donation-method"
                value={opt.value}
                checked={method === opt.value}
                onChange={() => setMethod(opt.value)}
                className={accent.radio}
              />
              <span className="text-sm text-text-secondary">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !amount || Number(amount) <= 0}
        className={`w-full ${accent.bg} text-white rounded-full py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {submitting ? 'Procesando...' : submitLabel ?? `Donar $${Number(amount || 0).toLocaleString()}`}
      </button>
    </form>
  );
}
