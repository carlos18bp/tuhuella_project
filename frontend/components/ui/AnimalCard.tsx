'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Dog, Cat, PawPrint } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import type { Animal } from '@/lib/types';

type AnimalCardProps = {
  animal: Animal;
};

export default function AnimalCard({ animal }: AnimalCardProps) {
  const t = useTranslations('animals');

  return (
    <Link
      href={ROUTES.ANIMAL_DETAIL(animal.id)}
      className="group h-full flex flex-col rounded-2xl border border-border-primary/80 bg-surface-primary overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-border-secondary/80 transition-all duration-300 card-teal"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-surface-tertiary to-surface-secondary relative">
        <div className="absolute inset-0 flex items-center justify-center text-stone-300">
          {animal.species === 'dog'
            ? <Dog data-testid="icon-dog" className="h-16 w-16" strokeWidth={1.2} />
            : animal.species === 'cat'
              ? <Cat data-testid="icon-cat" className="h-16 w-16" strokeWidth={1.2} />
              : <PawPrint data-testid="icon-other" className="h-16 w-16" strokeWidth={1.2} />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {animal.gender !== 'unknown' && (
          <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-surface-elevated/95 backdrop-blur-md ring-1 ring-border-primary text-teal-700 font-medium shadow-sm">
            {animal.gender === 'male' ? t('male') : t('female')}
          </span>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-text-primary group-hover:text-teal-600 transition-colors">
          {animal.name}
        </h3>
        <p className="text-sm text-text-tertiary mt-1">
          {animal.breed} · {animal.age_range} · {animal.size}
        </p>
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {animal.is_vaccinated && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-200/60">{t('vaccinated')}</span>
          )}
          {animal.is_sterilized && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-200/60">{t('sterilized')}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-border-tertiary">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 shadow-sm flex items-center justify-center">
            <PawPrint className="h-2.5 w-2.5 text-text-tertiary" />
          </div>
          <p className="text-xs text-text-quaternary">{animal.shelter_name}</p>
        </div>
      </div>
    </Link>
  );
}
