import { Link } from '@/i18n/navigation';
import { MapPin, BadgeCheck } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import type { Shelter } from '@/lib/types';

type ShelterCardProps = {
  shelter: Shelter;
};

export default function ShelterCard({ shelter }: ShelterCardProps) {
  return (
    <Link
      href={ROUTES.SHELTER_DETAIL(shelter.id)}
      className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">{shelter.name}</h3>
        {shelter.is_verified && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verificado
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 mt-2 text-sm text-stone-500">
        <MapPin className="h-3.5 w-3.5 text-stone-400" />
        {shelter.city}
      </div>
      {shelter.description && (
        <p className="text-sm text-stone-400 mt-2 line-clamp-2 leading-relaxed">{shelter.description}</p>
      )}
    </Link>
  );
}
