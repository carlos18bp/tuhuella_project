'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Dog, Cat, PawPrint } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import type { Animal } from '@/lib/types';

type AnimalCardListProps = {
  animal: Animal;
};

export default function AnimalCardList({ animal }: AnimalCardListProps) {
  const t = useTranslations('animals');

  return (
    <Link
      href={ROUTES.ANIMAL_DETAIL(animal.id)}
      className="group flex flex-row rounded-2xl border border-border-primary/80 bg-surface-primary overflow-hidden shadow-sm hover:shadow-lg hover:border-border-secondary/80 transition-all duration-300 card-teal"
    >
      <div className="w-28 sm:w-36 shrink-0 bg-gradient-to-br from-surface-tertiary to-surface-secondary relative">
        <div className="absolute inset-0 flex items-center justify-center text-stone-300">
          {animal.species === 'dog'
            ? <Dog className="h-12 w-12" strokeWidth={1.2} />
            : animal.species === 'cat'
              ? <Cat className="h-12 w-12" strokeWidth={1.2} />
              : <PawPrint className="h-12 w-12" strokeWidth={1.2} />}
        </div>
        {animal.gender !== 'unknown' && (
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated/95 backdrop-blur-md ring-1 ring-border-primary text-teal-700 font-medium shadow-sm">
            {animal.gender === 'male' ? t('male') : t('female')}
          </span>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text-primary group-hover:text-teal-600 transition-colors truncate">
            {animal.name}
          </h3>
        </div>

        <p className="text-sm text-text-tertiary mt-0.5 truncate">
          {animal.breed} · {animal.age_range} · {animal.size}
        </p>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {animal.is_vaccinated && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-200/60">{t('vaccinated')}</span>
          )}
          {animal.is_sterilized && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-200/60">{t('sterilized')}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-auto pt-2">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 shadow-sm flex items-center justify-center">
            <PawPrint className="h-2.5 w-2.5 text-text-tertiary" />
          </div>
          <p className="text-xs text-text-quaternary truncate">{animal.shelter_name}</p>
        </div>
      </div>
    </Link>
  );
}
