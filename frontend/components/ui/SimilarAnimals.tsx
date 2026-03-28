'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import AnimalCard from './AnimalCard';
import type { Animal } from '@/lib/types';

type SimilarAnimalsProps = {
  animalId: number;
};

export default function SimilarAnimals({ animalId }: SimilarAnimalsProps) {
  const t = useTranslations('animals');
  const [animals, setAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get(API_ENDPOINTS.ANIMAL_SIMILAR(animalId))
      .then((res) => {
        if (!cancelled) setAnimals(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [animalId]);

  if (animals.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border-primary pt-10">
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-text-primary mb-6">
        {t('similarAnimals')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {animals.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </div>
    </section>
  );
}
