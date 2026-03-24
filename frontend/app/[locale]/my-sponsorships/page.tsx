'use client';

import { useEffect } from 'react';
import { HeartHandshake } from 'lucide-react';

import { useSponsorshipStore } from '@/lib/stores/sponsorshipStore';

export default function MisApadrinamientosPage() {
  const sponsorships = useSponsorshipStore((s) => s.sponsorships);
  const loading = useSponsorshipStore((s) => s.loading);
  const fetchSponsorships = useSponsorshipStore((s) => s.fetchSponsorships);

  useEffect(() => {
    void fetchSponsorships();
  }, [fetchSponsorships]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <HeartHandshake className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Mis Apadrinamientos</h1>
          <p className="text-sm text-stone-500">Animales que estás apoyando</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-5">
              <div className="h-5 animate-shimmer rounded w-1/3" />
              <div className="h-3 animate-shimmer rounded w-1/4 mt-2" />
            </div>
          ))}
        </div>
      ) : sponsorships.length === 0 ? (
        <div className="mt-10 text-center py-12">
          <HeartHandshake className="h-12 w-12 text-stone-300 mx-auto" />
          <p className="mt-3 text-stone-400">No tienes apadrinamientos activos.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {sponsorships.map((sp) => (
            <div key={sp.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800">{sp.animal_name}</h3>
                  {sp.shelter_name && <p className="text-sm text-stone-500 mt-0.5">{sp.shelter_name}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600">${Number(sp.amount).toLocaleString()}/{sp.frequency === 'monthly' ? 'mes' : 'único'}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    sp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {sp.status === 'active' ? 'Activo' : sp.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
