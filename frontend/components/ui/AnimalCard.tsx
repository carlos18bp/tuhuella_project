import Link from 'next/link';
import { Dog, Cat, PawPrint } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import type { Animal } from '@/lib/types';

type AnimalCardProps = {
  animal: Animal;
};

export default function AnimalCard({ animal }: AnimalCardProps) {
  return (
    <Link
      href={ROUTES.ANIMAL_DETAIL(animal.id)}
      className="group rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-50 relative">
        <div className="absolute inset-0 flex items-center justify-center text-stone-300">
          {animal.species === 'dog'
            ? <Dog className="h-16 w-16" strokeWidth={1.2} />
            : animal.species === 'cat'
              ? <Cat className="h-16 w-16" strokeWidth={1.2} />
              : <PawPrint className="h-16 w-16" strokeWidth={1.2} />}
        </div>
        {animal.gender !== 'unknown' && (
          <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-teal-700 font-medium shadow-sm">
            {animal.gender === 'male' ? 'Macho' : 'Hembra'}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-800 group-hover:text-teal-600 transition-colors">
          {animal.name}
        </h3>
        <p className="text-sm text-stone-500 mt-1">
          {animal.breed} · {animal.age_range} · {animal.size}
        </p>
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {animal.is_vaccinated && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Vacunado</span>
          )}
          {animal.is_sterilized && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Esterilizado</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
          <div className="h-4 w-4 rounded-full bg-stone-200 flex items-center justify-center">
            <PawPrint className="h-2.5 w-2.5 text-stone-500" />
          </div>
          <p className="text-xs text-stone-400">{animal.shelter_name}</p>
        </div>
      </div>
    </Link>
  );
}
