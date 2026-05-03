'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

import { ROUTES } from '@/lib/constants';

export default function ShelterOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.SHELTER_APPLICATION);
  }, [router]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-20 text-center">
      <p className="text-text-tertiary">Redirigiendo…</p>
    </div>
  );
}
