'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Sponsorship, SponsorshipFrequency } from '@/lib/types';

type SponsorshipState = {
  sponsorships: Sponsorship[];
  loading: boolean;
  error: string | null;
  fetchSponsorships: () => Promise<void>;
  createSponsorship: (data: { animal: number; amount: number; frequency: SponsorshipFrequency }) => Promise<Sponsorship>;
};

export const useSponsorshipStore = create<SponsorshipState>((set) => ({
  sponsorships: [],
  loading: false,
  error: null,

  fetchSponsorships: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.SPONSORSHIPS);
      set({ sponsorships: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sponsorships';
      set({ error: message, loading: false });
    }
  },

  createSponsorship: async (data) => {
    const response = await api.post(API_ENDPOINTS.SPONSORSHIP_CREATE, data);
    return response.data;
  },
}));
