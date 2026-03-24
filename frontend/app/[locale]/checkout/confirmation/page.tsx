'use client';

import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { ROUTES } from '@/lib/constants';

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'donation';
  const status = searchParams.get('status') || 'placeholder';

  const isSponsorship = type === 'sponsorship';
  const isPlaceholder = status === 'placeholder';

  return (
    <div className="mx-auto max-w-xl px-6 py-10 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-sm">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
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
        <Link href={ROUTES.ANIMALS}
          className="bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 btn-base shadow-sm">
          Explorar animales
        </Link>
        <Link href={isSponsorship ? ROUTES.MY_SPONSORSHIPS : ROUTES.MY_DONATIONS}
          className="border border-stone-300 text-stone-600 rounded-full px-6 py-2.5 text-sm font-medium hover:bg-stone-50 btn-base">
          {isSponsorship ? 'Ver mis apadrinamientos' : 'Ver mis donaciones'}
        </Link>
      </div>

      <Link href={ROUTES.HOME} className="mt-6 inline-block text-sm text-stone-400 hover:text-stone-600 transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
}

export default function CheckoutConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-xl px-6 py-10 text-center">
        <p className="text-stone-400">Cargando confirmación...</p>
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  );
}
