'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Donation, DonationCreatePayload } from '@/lib/types';

type DonationState = {
  donations: Donation[];
  loading: boolean;
  error: string | null;
  fetchDonations: () => Promise<void>;
  createDonation: (data: DonationCreatePayload) => Promise<Donation>;
};

export const useDonationStore = create<DonationState>((set) => ({
  donations: [],
  loading: false,
  error: null,

  fetchDonations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.DONATIONS);
      set({ donations: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch donations';
      set({ error: message, loading: false });
    }
  },

  createDonation: async (data) => {
    const response = await api.post(API_ENDPOINTS.DONATION_CREATE, data);
    return response.data;
  },
}));
