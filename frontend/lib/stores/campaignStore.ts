'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Campaign } from '@/lib/types';

type CampaignState = {
  campaigns: Campaign[];
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  fetchCampaign: (id: number) => Promise<void>;
};

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  campaign: null,
  loading: false,
  error: null,

  fetchCampaigns: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.CAMPAIGNS);
      set({ campaigns: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      set({ error: message, loading: false });
    }
  },

  fetchCampaign: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.CAMPAIGN_DETAIL(id));
      set({ campaign: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch campaign';
      set({ error: message, loading: false });
    }
  },
}));
