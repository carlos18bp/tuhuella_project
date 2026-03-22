import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const footerLinks = [
  {
    title: 'Explorar',
    links: [
      { label: 'Animales', href: ROUTES.ANIMALS },
      { label: 'Refugios', href: ROUTES.SHELTERS },
      { label: 'Campañas', href: ROUTES.CAMPAIGNS },
      { label: 'Busco Adoptar', href: ROUTES.BUSCO_ADOPTAR },
    ],
  },
  {
    title: 'Mi Cuenta',
    links: [
      { label: 'Favoritos', href: ROUTES.FAVORITES },
      { label: 'Mis Solicitudes', href: ROUTES.MY_APPLICATIONS },
      { label: 'Mis Donaciones', href: ROUTES.MY_DONATIONS },
      { label: 'Mis Apadrinamientos', href: ROUTES.MY_SPONSORSHIPS },
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

export default function Footer() {
  return (
    <footer className="border-t border-stone-800 bg-stone-950 mt-16">
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-stone-100 mb-3">Mi&nbsp;Huella</h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Conectamos refugios con personas que quieren dar un hogar o apoyar a un animal.
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-stone-300 mb-3">{section.title}</h4>
              <ul className="space-y-2">
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
        <div className="mt-10 pt-6 border-t border-stone-800 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} Mi Huella. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
