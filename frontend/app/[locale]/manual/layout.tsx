'use client';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';

export default function ManualLayout({ children }: { children: React.ReactNode }) {
  useRequireAuth();

  return <div className="mx-auto max-w-[1400px] px-6 py-10">{children}</div>;
}
