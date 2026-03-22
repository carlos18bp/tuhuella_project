import Link from 'next/link';

import { ROUTES } from '@/lib/constants';
import type { Shelter } from '@/lib/types';

type ShelterCardProps = {
  shelter: Shelter;
};

export default function ShelterCard({ shelter }: ShelterCardProps) {
  return (
    <Link
      href={ROUTES.SHELTER_DETAIL(shelter.id)}
      className="rounded-2xl border border-stone-200 bg-white p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-800">{shelter.name}</h3>
        {shelter.is_verified && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Verificado</span>
        )}
      </div>
      <p className="text-sm text-stone-500 mt-2">{shelter.city}</p>
      {shelter.description && (
        <p className="text-sm text-stone-400 mt-1 line-clamp-2">{shelter.description}</p>
      )}
    </Link>
  );
}
