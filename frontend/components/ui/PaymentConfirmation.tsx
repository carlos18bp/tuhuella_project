'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface PaymentConfirmationProps {
  type: 'donation' | 'sponsorship';
  isPlaceholder?: boolean;
}

export default function PaymentConfirmation({ type, isPlaceholder = true }: PaymentConfirmationProps) {
  const isSponsorship = type === 'sponsorship';

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="mt-6 text-3xl font-bold text-stone-800">
        {isSponsorship ? 'Apadrinamiento registrado' : 'Donación registrada'}
      </h1>

      <p className="mt-3 text-stone-500 max-w-md mx-auto">
        {isSponsorship
          ? 'Tu apadrinamiento ha sido registrado exitosamente. El animal que elegiste ahora cuenta con tu apoyo.'
          : 'Tu donación ha sido registrada exitosamente. Gracias por tu generosidad.'}
      </p>

      {isPlaceholder && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Este es un flujo de pago placeholder. En producción, aquí se mostraría la confirmación real de Wompi.
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={ROUTES.ANIMALS}
          className="bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          Explorar animales
        </Link>
        <Link
          href={isSponsorship ? ROUTES.MY_SPONSORSHIPS : ROUTES.MY_DONATIONS}
          className="border border-stone-300 text-stone-600 rounded-full px-6 py-2.5 text-sm font-medium hover:bg-stone-50 transition-colors"
        >
          {isSponsorship ? 'Ver mis apadrinamientos' : 'Ver mis donaciones'}
        </Link>
      </div>

      <Link href={ROUTES.HOME} className="mt-6 inline-block text-sm text-stone-400 hover:text-stone-600 transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
}
