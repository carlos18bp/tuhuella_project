'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { AdoptionApplication, AdoptionApplicationStatus } from '@/lib/types';

type AdoptionState = {
  applications: AdoptionApplication[];
  loading: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  createApplication: (data: { animal: number; form_answers: Record<string, unknown>; notes?: string }) => Promise<AdoptionApplication>;
  updateStatus: (id: number, status: AdoptionApplicationStatus) => Promise<AdoptionApplication>;
};

export const useAdoptionStore = create<AdoptionState>((set) => ({
  applications: [],
  loading: false,
  error: null,

  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.ADOPTIONS);
      set({ applications: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch applications';
      set({ error: message, loading: false });
    }
  },

  createApplication: async (data) => {
    const response = await api.post(API_ENDPOINTS.ADOPTION_CREATE, data);
    return response.data;
  },

  updateStatus: async (id: number, status: AdoptionApplicationStatus) => {
    const response = await api.patch(API_ENDPOINTS.ADOPTION_UPDATE_STATUS(id), { status });
    return response.data;
  },
}));
