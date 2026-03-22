'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function BuscoAdoptarPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Busco Adoptar</h1>
      <p className="mt-2 text-stone-500 max-w-2xl">
        Publica tu intención de adoptar y deja que los refugios te encuentren.
        Describe qué tipo de compañero buscas y los refugios verificados podrán contactarte.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-stone-800">¿Cómo funciona?</h2>
          <ul className="mt-4 space-y-3 text-sm text-stone-600">
            <li className="flex gap-3">
              <span className="text-teal-600 font-bold">1.</span>
              Crea tu perfil de intención de adopción describiendo tus preferencias.
            </li>
            <li className="flex gap-3">
              <span className="text-teal-600 font-bold">2.</span>
              Los refugios revisan los perfiles y te envían invitaciones si tienen un animal compatible.
            </li>
            <li className="flex gap-3">
              <span className="text-teal-600 font-bold">3.</span>
              Acepta la invitación y comienza el proceso de adopción.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-8">
          <h2 className="text-lg font-semibold text-teal-800">Publica tu intención</h2>
          <p className="mt-2 text-sm text-teal-700">
            Inicia sesión para crear o editar tu perfil de adopción.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={ROUTES.MY_INTENT}
              className="bg-teal-600 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              Mi intención de adopción
            </Link>
            <Link
              href={ROUTES.SIGN_IN}
              className="border border-teal-300 text-teal-700 rounded-full px-5 py-2.5 text-sm font-medium hover:bg-teal-100 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
