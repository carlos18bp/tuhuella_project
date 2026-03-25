'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, BadgeCheck, Home } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import type { Shelter } from '@/lib/types';

type ShelterCardProps = {
  shelter: Shelter;
};

export default function ShelterCard({ shelter }: ShelterCardProps) {
  const t = useTranslations('shelters');
  const imageUrl = shelter.cover_image_url || shelter.logo_url;

  return (
    <Link
      href={ROUTES.SHELTER_DETAIL(shelter.id)}
      className="group h-full flex flex-col rounded-2xl border border-stone-200/80 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-stone-300/80 transition-all duration-300 card-emerald"
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-teal-50 to-stone-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={shelter.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
            <Home className="h-12 w-12" strokeWidth={1.2} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">{shelter.name}</h3>
          {shelter.is_verified && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium shrink-0 ring-1 ring-emerald-200/60">
              <BadgeCheck className="h-3.5 w-3.5" />
              {t('verified')}
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
      </div>
    </Link>
  );
}
