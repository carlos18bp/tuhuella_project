'use client';

import { create } from 'zustand';

import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  AdoptionApplication,
  Campaign,
  Shelter,
  PaginatedResponse,
} from '@/lib/types';

type ApplicationFilters = {
  status?: string;
  shelter?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

type ShelterFilters = {
  verification_status?: string;
  city?: string;
  page?: number;
  page_size?: number;
};

type CampaignFilters = {
  approval_status?: string;
  shelter?: number;
  page?: number;
  page_size?: number;
};

type PageMeta = { count: number; page: number; total_pages: number };

type WebManagerState = {
  shelters: Shelter[];
  sheltersMeta: PageMeta | null;
  sheltersLoading: boolean;
  applications: AdoptionApplication[];
  applicationsMeta: PageMeta | null;
  applicationsLoading: boolean;
  campaigns: Campaign[];
  campaignsMeta: PageMeta | null;
  campaignsLoading: boolean;
  error: string | null;
  fetchShelters: (filters?: ShelterFilters) => Promise<void>;
  fetchApplications: (filters?: ApplicationFilters) => Promise<void>;
  fetchShelterApplications: (shelterId: number, filters?: ApplicationFilters) => Promise<void>;
  fetchCampaigns: (filters?: CampaignFilters) => Promise<void>;
  approveCampaign: (id: number) => Promise<Campaign>;
  rejectCampaign: (id: number, reason: string) => Promise<Campaign>;
};

const buildParams = (filters?: Record<string, unknown>) => {
  const params = new URLSearchParams();
  if (!filters) return '';
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const useWebManagerStore = create<WebManagerState>((set, get) => ({
  shelters: [],
  sheltersMeta: null,
  sheltersLoading: false,
  applications: [],
  applicationsMeta: null,
  applicationsLoading: false,
  campaigns: [],
  campaignsMeta: null,
  campaignsLoading: false,
  error: null,

  fetchShelters: async (filters) => {
    set({ sheltersLoading: true, error: null });
    try {
      const res = await api.get<PaginatedResponse<Shelter>>(
        `${API_ENDPOINTS.ADMIN_SHELTERS_ALL}${buildParams(filters)}`,
      );
      set({
        shelters: res.data.results,
        sheltersMeta: {
          count: res.data.count,
          page: res.data.page,
          total_pages: res.data.total_pages,
        },
        sheltersLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      set({ sheltersLoading: false, error: msg });
    }
  },

  fetchApplications: async (filters) => {
    set({ applicationsLoading: true, error: null });
    try {
      const res = await api.get<PaginatedResponse<AdoptionApplication>>(
        `${API_ENDPOINTS.ADMIN_APPLICATIONS}${buildParams(filters)}`,
      );
      set({
        applications: res.data.results,
        applicationsMeta: {
          count: res.data.count,
          page: res.data.page,
          total_pages: res.data.total_pages,
        },
        applicationsLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      set({ applicationsLoading: false, error: msg });
    }
  },

  fetchShelterApplications: async (shelterId, filters) => {
    set({ applicationsLoading: true, error: null });
    try {
      const res = await api.get<PaginatedResponse<AdoptionApplication>>(
        `${API_ENDPOINTS.ADMIN_SHELTER_APPLICATIONS(shelterId)}${buildParams(filters)}`,
      );
      set({
        applications: res.data.results,
        applicationsMeta: {
          count: res.data.count,
          page: res.data.page,
          total_pages: res.data.total_pages,
        },
        applicationsLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      set({ applicationsLoading: false, error: msg });
    }
  },

  fetchCampaigns: async (filters) => {
    set({ campaignsLoading: true, error: null });
    try {
      const res = await api.get<PaginatedResponse<Campaign>>(
        `${API_ENDPOINTS.ADMIN_CAMPAIGNS}${buildParams(filters)}`,
      );
      set({
        campaigns: res.data.results,
        campaignsMeta: {
          count: res.data.count,
          page: res.data.page,
          total_pages: res.data.total_pages,
        },
        campaignsLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      set({ campaignsLoading: false, error: msg });
    }
  },

  approveCampaign: async (id) => {
    const res = await api.post<Campaign>(API_ENDPOINTS.ADMIN_CAMPAIGN_APPROVE(id), {});
    const updated = res.data;
    set((s) => ({
      campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));
    return updated;
  },

  rejectCampaign: async (id, reason) => {
    const res = await api.post<Campaign>(API_ENDPOINTS.ADMIN_CAMPAIGN_REJECT(id), { reason });
    const updated = res.data;
    set((s) => ({
      campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));
    return updated;
  },
}));
