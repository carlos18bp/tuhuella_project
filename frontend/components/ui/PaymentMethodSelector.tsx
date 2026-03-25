'use client';

interface PaymentMethod {
  value: string;
  label: string;
}

interface PaymentMethodSelectorProps {
  selected: string;
  onChange: (value: string) => void;
  accentColor?: string;
  methods?: PaymentMethod[];
}

const defaultMethods: PaymentMethod[] = [
  { value: 'card', label: 'Tarjeta de crédito/débito' },
  { value: 'pse', label: 'PSE (transferencia bancaria)' },
  { value: 'nequi', label: 'Nequi' },
];

export default function PaymentMethodSelector({
  selected,
  onChange,
  accentColor = 'amber',
  methods = defaultMethods,
}: PaymentMethodSelectorProps) {
  const borderActive = `border-${accentColor}-500 bg-${accentColor}-50`;
  const accentClass = `accent-${accentColor}-600`;

  return (
    <div>
      <label className="block text-sm font-medium tracking-[-0.01em] text-stone-700">Método de pago</label>
      <div className="mt-2 space-y-2">
        {methods.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
              selected === opt.value ? `${borderActive} ring-1 ring-${accentColor}-500` : 'border-stone-200 hover:bg-stone-50 hover:border-stone-300 hover:shadow-sm'
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value={opt.value}
              checked={selected === opt.value}
              onChange={() => onChange(opt.value)}
              className={accentClass}
            />
            <span className="text-sm text-stone-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
