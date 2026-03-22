'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type AnimalGalleryProps = {
  images: string[];
  species: string;
  name: string;
};

export default function AnimalGallery({ images, species, name }: AnimalGalleryProps) {
  const fallbackEmoji = species === 'dog' ? '🐕' : species === 'cat' ? '🐈' : '🐾';

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-stone-100 flex items-center justify-center text-8xl text-stone-300">
        {fallbackEmoji}
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100">
        <img
          src={images[0]}
          alt={`${name} - foto`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={0}
        slidesPerView={1}
        className="animal-gallery"
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <div className="aspect-square bg-stone-100">
              <img
                src={src}
                alt={`${name} - foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
