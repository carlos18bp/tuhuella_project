'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Campaign, CampaignMessage } from '@/lib/types';

type CampaignPayload = Partial<{
  shelter: number;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  goal_amount: string | number;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
}>;

type CampaignState = {
  campaigns: Campaign[];
  campaign: Campaign | null;
  messagesByCampaign: Record<number, CampaignMessage[]>;
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
  fetchCampaigns: (lang?: string, status?: string) => Promise<void>;
  fetchMyCampaigns: (lang?: string) => Promise<void>;
  fetchCampaign: (id: number, lang?: string) => Promise<void>;
  createCampaign: (payload: CampaignPayload, lang?: string) => Promise<Campaign>;
  updateCampaign: (id: number, payload: CampaignPayload, lang?: string) => Promise<Campaign>;
  submitForApproval: (id: number, lang?: string) => Promise<Campaign>;
  fetchMessages: (id: number, lang?: string) => Promise<void>;
  sendMessage: (id: number, body: string, lang?: string) => Promise<CampaignMessage>;
};

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  campaign: null,
  messagesByCampaign: {},
  loading: false,
  messagesLoading: false,
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

  fetchMyCampaigns: async (lang?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.CAMPAIGNS_MINE, {
        params: lang ? { lang } : {},
      });
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

  createCampaign: async (payload, lang) => {
    const res = await api.post<Campaign>(API_ENDPOINTS.CAMPAIGN_CREATE, payload, {
      params: lang ? { lang } : {},
    });
    set((s) => ({ campaign: res.data, campaigns: [res.data, ...s.campaigns] }));
    return res.data;
  },

  updateCampaign: async (id, payload, lang) => {
    const res = await api.patch<Campaign>(API_ENDPOINTS.CAMPAIGN_UPDATE(id), payload, {
      params: lang ? { lang } : {},
    });
    set({ campaign: res.data });
    return res.data;
  },

  submitForApproval: async (id, lang) => {
    const res = await api.post<Campaign>(API_ENDPOINTS.CAMPAIGN_SUBMIT(id), {}, {
      params: lang ? { lang } : {},
    });
    set({ campaign: res.data });
    return res.data;
  },

  fetchMessages: async (id, lang) => {
    set({ messagesLoading: true, error: null });
    try {
      const res = await api.get<CampaignMessage[]>(API_ENDPOINTS.CAMPAIGN_MESSAGES(id), {
        params: lang ? { lang } : {},
      });
      set((s) => ({
        messagesByCampaign: { ...s.messagesByCampaign, [id]: res.data },
        messagesLoading: false,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch messages';
      set({ messagesLoading: false, error: message });
    }
  },

  sendMessage: async (id, body, lang) => {
    const res = await api.post<CampaignMessage>(
      API_ENDPOINTS.CAMPAIGN_MESSAGES(id),
      { body },
      { params: lang ? { lang } : {} },
    );
    const current = get().messagesByCampaign[id] || [];
    set((s) => ({
      messagesByCampaign: { ...s.messagesByCampaign, [id]: [...current, res.data] },
    }));
    return res.data;
  },
}));
