'use client';

import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Container } from '@/components/ui';
import { ROUTES } from '@/lib/constants';

// Wompi (and any future gateway) can report a payment back in any of these
// terminal-failure states. Anything NOT in this set and NOT 'placeholder'
// used to fall through to the success copy below.
const FAILURE_STATUSES = new Set(['declined', 'error', 'failed', 'voided']);

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'donation';
  const status = searchParams.get('status') || 'placeholder';

  const isSponsorship = type === 'sponsorship';
  const isPlaceholder = status === 'placeholder';
  const isFailure = FAILURE_STATUSES.has(status);

  return (
    <Container className="py-10 min-w-0">
    <div className="mx-auto max-w-xl text-center">
      <div className={isFailure
        ? "mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950/40 dark:to-red-900/25 flex items-center justify-center shadow-sm ring-1 ring-red-200/60 dark:ring-red-700/40"
        : "mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/40 dark:to-emerald-900/25 flex items-center justify-center shadow-sm ring-1 ring-emerald-200/60 dark:ring-emerald-700/40"
      }>
        {isFailure
          ? <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          : <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
      </div>

      <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-text-primary">
        {isFailure
          ? (isSponsorship ? 'Tu apadrinamiento no pudo procesarse' : 'Tu donación no pudo procesarse')
          : (isSponsorship ? 'Apadrinamiento registrado' : 'Donación registrada')}
      </h1>

      <p className="mt-3 text-text-tertiary max-w-md mx-auto">
        {isFailure
          ? (isSponsorship
              ? 'No pudimos confirmar el pago de tu apadrinamiento. No se realizó ningún cobro; podés intentarlo de nuevo cuando quieras.'
              : 'No pudimos confirmar el pago de tu donación. No se realizó ningún cobro; podés intentarlo de nuevo cuando quieras.')
          : (isSponsorship
              ? 'Tu apadrinamiento ha sido registrado exitosamente. El animal que elegiste ahora cuenta con tu apoyo.'
              : 'Tu donación ha sido registrada exitosamente. Gracias por tu generosidad.')}
      </p>

      {isPlaceholder && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/25 dark:text-amber-300">
          Este es un flujo de pago placeholder. En producción, aquí se mostraría la confirmación real de Wompi.
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        {/* Retry must return to the checkout the user actually came from. This
            branch used to be unconditional CHECKOUT_DONATION, so a declined
            SPONSORSHIP sent the user to the donation form — a different product
            at a different price. The secondary CTA below already branched on
            isSponsorship; this one did not. */}
        <Link
          href={isFailure
            ? (isSponsorship ? ROUTES.CHECKOUT_SPONSORSHIP : ROUTES.CHECKOUT_DONATION)
            : ROUTES.ANIMALS}
          className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-teal-600 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-teal-700 btn-base shadow-sm"
        >
          {isFailure ? 'Intentar de nuevo' : 'Explorar animales'}
        </Link>
        <Link
          href={isFailure ? ROUTES.ANIMALS : (isSponsorship ? ROUTES.MY_SPONSORSHIPS : ROUTES.MY_DONATIONS)}
          className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto border border-border-secondary text-text-secondary rounded-full px-6 py-2.5 text-sm font-medium hover:bg-surface-hover dark:hover:bg-surface-hover btn-base"
        >
          {isFailure ? 'Explorar animales' : (isSponsorship ? 'Ver mis apadrinamientos' : 'Ver mis donaciones')}
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
