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
  fetchCampaigns: (lang?: string, status?: string) => Promise<void>;
  fetchCampaign: (id: number, lang?: string) => Promise<void>;
};

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  campaign: null,
  loading: false,
  error: null,

  fetchCampaigns: async (lang?: string, status?: string) => {
    set({ loading: true, error: null });
    try {
      const params: Record<string, string> = {};
      if (lang) params.lang = lang;
      if (status) params.status = status;
      const response = await api.get(API_ENDPOINTS.CAMPAIGNS, { params });
      set({ campaigns: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      set({ error: message, loading: false });
    }
  },

  fetchCampaign: async (id: number, lang?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.CAMPAIGN_DETAIL(id), {
        params: lang ? { lang } : {},
      });
      set({ campaign: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch campaign';
      set({ error: message, loading: false });
    }
  },
}));
