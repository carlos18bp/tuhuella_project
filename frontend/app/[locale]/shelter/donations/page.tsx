'use client';

import { useEffect } from 'react';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useDonationStore } from '@/lib/stores/donationStore';

export default function ShelterDonacionesPage() {
  useRequireAuth();
  const donations = useDonationStore((s) => s.donations);
  const loading = useDonationStore((s) => s.loading);
  const fetchDonations = useDonationStore((s) => s.fetchDonations);

  useEffect(() => {
    void fetchDonations();
  }, [fetchDonations]);

  const totalPaid = donations
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-text-primary">Donaciones Recibidas</h1>

      {!loading && donations.length > 0 && (
        <div className="mt-4 inline-block rounded-xl bg-amber-50 border border-amber-200 px-4 py-2">
          <p className="text-sm text-amber-700">
            Total recaudado: <span className="font-bold">${totalPaid.toLocaleString()}</span>
          </p>
        </div>
      )}

      {loading ? (
        <div data-testid="loading-skeleton" className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary p-5 animate-pulse">
              <div className="h-5 bg-surface-tertiary rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : donations.length === 0 ? (
        <p className="mt-8 text-text-quaternary">No has recibido donaciones aún.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="rounded-xl border border-border-primary bg-surface-primary p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text-primary">${Number(donation.amount).toLocaleString()}</p>
                  <p className="text-sm text-text-tertiary mt-0.5">{donation.user_email}</p>
                  {donation.campaign_title && (
                    <p className="text-xs text-amber-600 mt-0.5">Campaña: {donation.campaign_title}</p>
                  )}
                  {donation.message && (
                    <p className="text-sm text-text-secondary mt-2 bg-surface-secondary rounded-lg p-2">&ldquo;{donation.message}&rdquo;</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    donation.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-tertiary text-text-secondary'
                  }`}>
                    {donation.status === 'paid' ? 'Pagada' : donation.status}
                  </span>
                  <p className="text-xs text-text-quaternary mt-1">{new Date(donation.created_at).toLocaleDateString('es')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
