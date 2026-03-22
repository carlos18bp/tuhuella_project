import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const VALID_LOCALES = ['en', 'es'];

export default getRequestConfig(async () => {
  let locale = 'es';

  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('locale')?.value;
    if (raw) {
      const parsed = JSON.parse(raw);
      const stored = parsed?.state?.locale;
      if (stored && VALID_LOCALES.includes(stored)) {
        locale = stored;
      }
    }
  } catch {
    // fallback to default
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
