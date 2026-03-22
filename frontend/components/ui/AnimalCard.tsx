import Link from 'next/link';

import { ROUTES } from '@/lib/constants';
import type { Animal } from '@/lib/types';

type AnimalCardProps = {
  animal: Animal;
};

export default function AnimalCard({ animal }: AnimalCardProps) {
  return (
    <Link
      href={ROUTES.ANIMAL_DETAIL(animal.id)}
      className="group rounded-2xl border border-stone-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-stone-100 relative">
        <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-4xl">
          {animal.species === 'dog' ? '🐕' : animal.species === 'cat' ? '🐈' : '🐾'}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-800 group-hover:text-teal-600 transition-colors">
            {animal.name}
          </h3>
          {animal.gender !== 'unknown' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
              {animal.gender === 'male' ? 'Macho' : 'Hembra'}
            </span>
          )}
        </div>
        <p className="text-sm text-stone-500 mt-1">
          {animal.breed} · {animal.age_range} · {animal.size}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {animal.is_vaccinated && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Vacunado</span>
          )}
          {animal.is_sterilized && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Esterilizado</span>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-2">{animal.shelter_name}</p>
      </div>
    </Link>
  );
}
