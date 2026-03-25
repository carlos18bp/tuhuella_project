'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PawPrint } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/lib/stores/authStore';

export default function Footer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  const publicLinks = [
    {
      title: t('explore'),
      links: [
        { label: tNav('animals'), href: ROUTES.ANIMALS },
        { label: tNav('shelters'), href: ROUTES.SHELTERS },
        { label: tNav('campaigns'), href: ROUTES.CAMPAIGNS },
        { label: tNav('lookingToAdopt'), href: ROUTES.LOOKING_TO_ADOPT },
        { label: tNav('blog'), href: ROUTES.BLOG },
      ],
    },
    {
      title: t('information'),
      links: [
        { label: t('faq'), href: ROUTES.FAQ },
        { label: t('about'), href: ROUTES.ABOUT },
        { label: t('workWithUs'), href: ROUTES.WORK_WITH_US },
        { label: t('strategicAllies'), href: ROUTES.STRATEGIC_ALLIES },
        { label: t('registerShelter'), href: ROUTES.SHELTER_ONBOARDING },
        { label: t('terms'), href: ROUTES.TERMS },
      ],
    },
  ];

  const accountLinks = {
    title: t('myAccount'),
    links: [
      { label: t('favorites'), href: ROUTES.FAVORITES },
      { label: t('myApplications'), href: ROUTES.MY_APPLICATIONS },
      { label: t('myDonations'), href: ROUTES.MY_DONATIONS },
      { label: t('mySponsorships'), href: ROUTES.MY_SPONSORSHIPS },
    ],
  };

  const footerLinks = isAuthenticated ? [publicLinks[0], accountLinks, publicLinks[1]] : publicLinks;

  return (
    <footer className="relative bg-stone-950 mt-16">
      {/* Gradient fade top */}
      <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PawPrint className="h-5 w-5 text-teal-400" />
              <h3 className="text-lg font-bold text-stone-100">Tu&nbsp;Huella</h3>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              {t('description')}
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4 pl-3 border-l-2 border-teal-500/40">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-400 hover:text-teal-400 hover:translate-x-0.5 transition-all duration-200 inline-block"
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
              <span className="text-xs text-stone-500">{t('designedBy')}</span>
              <a
                href="https://projectapp.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group hover:scale-105 transition-transform duration-200"
              >
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
              <span className="text-xs text-stone-500">{t('supportedBy')}</span>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group hover:scale-105 transition-transform duration-200"
              >
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
            &copy; {new Date().getFullYear()} Tu Huella. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
