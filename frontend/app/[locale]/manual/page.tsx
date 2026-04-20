'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { MANUAL_SECTIONS } from '@/lib/manual/content';
import { filterManualSectionsForRole } from '@/lib/manual/filterByRole';
import type { ManualLocale } from '@/lib/manual/types';
import { useAuthStore } from '@/lib/stores/authStore';
import ManualSidebar from '@/components/manual/ManualSidebar';
import ManualSearch from '@/components/manual/ManualSearch';
import ProcessCard from '@/components/manual/ProcessCard';

export default function ManualPage() {
  const rawLocale = useLocale();
  const locale: ManualLocale = rawLocale === 'en' ? 'en' : 'es';
  const t = useTranslations('manual');
  const role = useAuthStore((s) => s.user?.role);

  const visibleSections = useMemo(
    () => filterManualSectionsForRole(MANUAL_SECTIONS, role),
    [role],
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <ManualSidebar sections={visibleSections} locale={locale} />

      <div className="min-w-0 flex-1">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
            {t('eyebrow')}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-text-primary">{t('title')}</h1>
          <p className="mt-2 max-w-3xl text-sm text-text-secondary">{t('subtitle')}</p>
        </header>

        <div className="sticky top-20 z-30 mb-8">
          <ManualSearch sections={visibleSections} locale={locale} />
        </div>

        <div className="flex flex-col gap-10">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.id} id={`section-${section.id}`} className="scroll-mt-24">
                <header className="mb-4 flex items-center gap-3 border-b border-border-primary pb-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      section.highlight
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
                        : 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">
                      {section.title[locale]}
                    </h2>
                    {section.highlight && (
                      <p className="text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        {t('startHere')}
                      </p>
                    )}
                  </div>
                </header>

                <div className="flex flex-col gap-4">
                  {section.processes.map((process) => (
                    <ProcessCard key={process.id} process={process} locale={locale} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
