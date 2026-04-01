'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import { useMinWidthSm } from '@/lib/hooks/useMediaQuery';
import AnimalCard from './AnimalCard';
import type { Animal } from '@/lib/types';

type SimilarAnimalsProps = {
  animalId: number;
};

export default function SimilarAnimals({ animalId }: SimilarAnimalsProps) {
  const t = useTranslations('animals');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const isSmUp = useMinWidthSm();

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

      {isSmUp ? (
        <div data-testid="similar-animals-desktop" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {animals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      ) : (
        <div
          data-testid="similar-animals-mobile"
          className="overflow-x-hidden min-w-0 -mx-1 px-1"
        >
          <Swiper
            modules={[Pagination]}
            spaceBetween={12}
            slidesPerView={1.15}
            pagination={{ clickable: true }}
            className="pb-10"
          >
            {animals.map((animal) => (
              <SwiperSlide key={animal.id}>
                <AnimalCard animal={animal} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
}
