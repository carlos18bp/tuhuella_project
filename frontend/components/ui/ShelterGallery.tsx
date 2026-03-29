'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type ShelterGalleryProps = {
  images: string[];
  shelterName: string;
};

export default function ShelterGallery({ images, shelterName }: ShelterGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="shelter-gallery"
        >
          {images.map((src, i) => (
            <SwiperSlide key={i}>
              <button
                onClick={() => setLightboxIndex(i)}
                className="relative w-full aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
              >
                <Image
                  src={src}
                  alt={`${shelterName} - ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Lightbox — uses img for full-res viewing */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-6 w-6" />
          </button>

          <span className="absolute top-5 left-1/2 -translate-x-1/2 text-sm text-white/70 font-medium">
            {lightboxIndex + 1} / {images.length}
          </span>

          {images.length > 1 && (
            <button
              aria-label="Anterior"
              className="absolute left-3 md:left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightboxIndex]}
            alt={`${shelterName} - ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              aria-label="Siguiente"
              className="absolute right-3 md:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex + 1) % images.length);
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
