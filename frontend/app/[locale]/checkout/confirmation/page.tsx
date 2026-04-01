'use client';

import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Container } from '@/components/ui';
import { ROUTES } from '@/lib/constants';

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'donation';
  const status = searchParams.get('status') || 'placeholder';

  const isSponsorship = type === 'sponsorship';
  const isPlaceholder = status === 'placeholder';

  return (
    <Container className="py-10 min-w-0">
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/40 dark:to-emerald-900/25 flex items-center justify-center shadow-sm ring-1 ring-emerald-200/60 dark:ring-emerald-700/40">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </div>

      <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-text-primary">
        {isSponsorship ? 'Apadrinamiento registrado' : 'Donación registrada'}
      </h1>

      <p className="mt-3 text-text-tertiary max-w-md mx-auto">
        {isSponsorship
          ? 'Tu apadrinamiento ha sido registrado exitosamente. El animal que elegiste ahora cuenta con tu apoyo.'
          : 'Tu donación ha sido registrada exitosamente. Gracias por tu generosidad.'}
      </p>

      {isPlaceholder && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/25 dark:text-amber-300">
          Este es un flujo de pago placeholder. En producción, aquí se mostraría la confirmación real de Wompi.
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        <Link
          href={ROUTES.ANIMALS}
          className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 btn-base shadow-sm"
        >
          Explorar animales
        </Link>
        <Link
          href={isSponsorship ? ROUTES.MY_SPONSORSHIPS : ROUTES.MY_DONATIONS}
          className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto border border-border-secondary text-text-secondary rounded-full px-6 py-2.5 text-sm font-medium hover:bg-surface-hover dark:hover:bg-surface-hover btn-base"
        >
          {isSponsorship ? 'Ver mis apadrinamientos' : 'Ver mis donaciones'}
        </Link>
      </div>

      <Link
        href={ROUTES.HOME}
        className="mt-6 inline-flex items-center justify-center min-h-11 text-sm text-text-quaternary hover:text-text-secondary transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
    </Container>
  );
}

export default function CheckoutConfirmacionPage() {
  return (
    <Suspense fallback={
      <Container className="py-10 min-w-0">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-text-quaternary">Cargando confirmación...</p>
        </div>
      </Container>
    }>
      <ConfirmacionContent />
    </Suspense>
  );
}
