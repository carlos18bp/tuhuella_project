'use client';

import { useEffect } from 'react';

import { useDonationStore } from '@/lib/stores/donationStore';

export default function MisDonacionesPage() {
  const donations = useDonationStore((s) => s.donations);
  const loading = useDonationStore((s) => s.loading);
  const fetchDonations = useDonationStore((s) => s.fetchDonations);

  useEffect(() => {
    void fetchDonations();
  }, [fetchDonations]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Mis Donaciones</h1>

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-5 animate-pulse">
              <div className="h-5 bg-stone-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : donations.length === 0 ? (
        <p className="mt-8 text-stone-400">No tienes donaciones registradas.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800">${Number(donation.amount).toLocaleString()}</p>
                  {donation.campaign_title && (
                    <p className="text-sm text-amber-600 mt-0.5">{donation.campaign_title}</p>
                  )}
                  {donation.shelter_name && (
                    <p className="text-sm text-stone-500 mt-0.5">{donation.shelter_name}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  donation.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                }`}>
                  {donation.status === 'paid' ? 'Pagada' : donation.status}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-2">{new Date(donation.created_at).toLocaleDateString('es')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
