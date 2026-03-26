'use client';

import { useEffect } from 'react';
import { HandCoins } from 'lucide-react';

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
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <HandCoins className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Mis Donaciones</h1>
          <p className="text-sm text-text-tertiary">Historial de tus contribuciones</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-5">
              <div className="h-5 animate-shimmer rounded w-1/3" />
              <div className="h-3 animate-shimmer rounded w-1/4 mt-2" />
            </div>
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="mt-10 text-center py-12">
          <HandCoins className="h-12 w-12 text-stone-300 mx-auto" />
          <p className="mt-3 text-text-quaternary">No tienes donaciones registradas.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text-primary">${Number(donation.amount).toLocaleString()}</p>
                  {donation.campaign_title && (
                    <p className="text-sm text-amber-600 mt-0.5">{donation.campaign_title}</p>
                  )}
                  {donation.shelter_name && (
                    <p className="text-sm text-text-tertiary mt-0.5">{donation.shelter_name}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  donation.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-tertiary text-text-secondary'
                }`}>
                  {donation.status === 'paid' ? 'Pagada' : donation.status}
                </span>
              </div>
              <p className="text-xs text-text-quaternary mt-2">{new Date(donation.created_at).toLocaleDateString('es')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
