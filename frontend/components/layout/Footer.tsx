'use client';

import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/lib/stores/authStore';

const publicLinks = [
  {
    title: 'Explorar',
    links: [
      { label: 'Animales', href: ROUTES.ANIMALS },
      { label: 'Refugios', href: ROUTES.SHELTERS },
      { label: 'Campañas', href: ROUTES.CAMPAIGNS },
      { label: 'Busco Adoptar', href: ROUTES.LOOKING_TO_ADOPT },
      { label: 'Blog', href: ROUTES.BLOG },
    ],
  },
  {
    title: 'Información',
    links: [
      { label: 'Preguntas Frecuentes', href: ROUTES.FAQ },
      { label: 'Registrar Refugio', href: ROUTES.SHELTER_ONBOARDING },
    ],
  },
];

const accountLinks = {
  title: 'Mi Cuenta',
  links: [
    { label: 'Favoritos', href: ROUTES.FAVORITES },
    { label: 'Mis Solicitudes', href: ROUTES.MY_APPLICATIONS },
    { label: 'Mis Donaciones', href: ROUTES.MY_DONATIONS },
    { label: 'Mis Apadrinamientos', href: ROUTES.MY_SPONSORSHIPS },
  ],
};

export default function Footer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const footerLinks = isAuthenticated ? [publicLinks[0], accountLinks, publicLinks[1]] : publicLinks;
  return (
    <footer className="relative bg-stone-950 mt-16">
      {/* Gradient fade top */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PawPrint className="h-5 w-5 text-teal-400" />
              <h3 className="text-lg font-bold text-stone-100">Tu&nbsp;Huella</h3>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Conectamos refugios con personas que quieren dar un hogar o apoyar a un animal.
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-400 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Branding — Partners */}
        <div className="mt-12 pt-8 border-t border-stone-800/60">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500">Diseñado por</span>
              <a
                href="https://projectapp.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                {/* Logo placeholder — replace with <Image> when assets are ready */}
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-stone-800 text-xs font-bold text-teal-400 ring-1 ring-stone-700 group-hover:ring-teal-500 transition-colors">
                  PA
                </span>
                <span className="text-sm text-stone-400 group-hover:text-teal-400 transition-colors">
                  ProjectApp.co
                </span>
              </a>
            </div>

            <span className="hidden sm:block text-stone-700">|</span>

            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500">Con el apoyo de</span>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                {/* Logo placeholder — replace with <Image> when assets are ready */}
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-stone-800 text-xs font-bold text-emerald-400 ring-1 ring-stone-700 group-hover:ring-emerald-500 transition-colors">
                  EE
                </span>
                <span className="text-sm text-stone-400 group-hover:text-emerald-400 transition-colors">
                  Entre Especies Veterinaria
                </span>
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-stone-500">
            &copy; {new Date().getFullYear()} Tu Huella. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
