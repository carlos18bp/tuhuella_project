'use client';

import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, Globe } from 'lucide-react';

import { useShelterStore } from '@/lib/stores/shelterStore';
import { ROUTES } from '@/lib/constants';

export default function ShelterDetailPage() {
  const params = useParams();
  const shelterId = Number(params.shelterId);

  const shelter = useShelterStore((s) => s.shelter);
  const loading = useShelterStore((s) => s.loading);
  const fetchShelter = useShelterStore((s) => s.fetchShelter);

  useEffect(() => {
    if (shelterId) void fetchShelter(shelterId);
  }, [shelterId, fetchShelter]);

  if (loading || !shelter) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10 space-y-4">
        <div className="h-8 animate-shimmer rounded w-1/3" />
        <div className="h-4 animate-shimmer rounded w-1/2" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-4 h-20 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <Link href={ROUTES.SHELTERS} className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a refugios
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-stone-800">{shelter.name}</h1>
        <div className="flex items-center gap-1.5 mt-1 text-stone-500">
          <MapPin className="h-4 w-4 text-stone-400" />
          {shelter.city}
        </div>
        {shelter.description && (
          <p className="mt-4 text-stone-600 leading-relaxed max-w-3xl">{shelter.description}</p>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelter.phone && (
            <div className="rounded-xl border border-stone-200 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-stone-400" />
                <p className="text-xs text-stone-500">Teléfono</p>
              </div>
              <p className="text-sm font-medium text-stone-700 mt-1.5">{shelter.phone}</p>
            </div>
          )}
          {shelter.email && (
            <div className="rounded-xl border border-stone-200 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-stone-400" />
                <p className="text-xs text-stone-500">Email</p>
              </div>
              <p className="text-sm font-medium text-stone-700 mt-1.5">{shelter.email}</p>
            </div>
          )}
          {shelter.website && (
            <div className="rounded-xl border border-stone-200 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-stone-400" />
                <p className="text-xs text-stone-500">Sitio web</p>
              </div>
              <a href={shelter.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-teal-600 mt-1.5 hover:underline block">
                {shelter.website}
              </a>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link
            href={`${ROUTES.ANIMALS}?shelter=${shelter.id}`}
            className="bg-teal-600 text-white rounded-full px-6 py-3 font-medium hover:bg-teal-700 btn-base shadow-sm inline-block"
          >
            Ver animales de este refugio
          </Link>
        </div>
      </div>
    </div>
  );
}
