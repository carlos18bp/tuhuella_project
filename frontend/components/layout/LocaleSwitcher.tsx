'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = (target: 'es' | 'en') => {
    if (locale === target) return;
    router.replace(pathname, { locale: target });
  };

  return (
    <div
      className="relative flex items-center rounded-full border border-stone-300 bg-stone-100 shadow-inner p-0.5 text-xs font-medium select-none"
      role="radiogroup"
      aria-label="Select language"
    >
      {/* Sliding highlight */}
      <span
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-gradient-to-r from-teal-600 to-teal-500 shadow-sm transition-transform duration-200 ease-in-out ${
          locale === 'en' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
        }`}
      />

      <button
        type="button"
        role="radio"
        aria-checked={locale === 'es'}
        onClick={() => toggle('es')}
        className={`relative z-10 px-3 py-1 rounded-full cursor-pointer transition-colors duration-200 ${
          locale === 'es' ? 'text-white' : 'text-stone-500 hover:text-stone-700'
        }`}
      >
        ES
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={locale === 'en'}
        onClick={() => toggle('en')}
        className={`relative z-10 px-3 py-1 rounded-full cursor-pointer transition-colors duration-200 ${
          locale === 'en' ? 'text-white' : 'text-stone-500 hover:text-stone-700'
        }`}
      >
        EN
      </button>
    </div>
  );
}
