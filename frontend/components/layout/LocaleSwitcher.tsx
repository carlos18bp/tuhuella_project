'use client';

import { useLocaleStore } from '@/lib/stores/localeStore';
import { SUPPORTED_LOCALES, LOCALE_LABELS } from '@/lib/i18n/config';

export default function LocaleSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <select
      value={locale}
      onChange={(e) => {
        setLocale(e.target.value);
        window.location.reload();
      }}
      className="text-xs bg-transparent border border-stone-300 rounded-lg px-2 py-1.5 text-stone-600 cursor-pointer hover:border-stone-400 transition-colors"
      aria-label="Select language"
    >
      {SUPPORTED_LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc]}
        </option>
      ))}
    </select>
  );
}
