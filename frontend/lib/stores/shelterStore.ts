'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Shelter } from '@/lib/types';

type ShelterState = {
  shelters: Shelter[];
  shelter: Shelter | null;
  loading: boolean;
  error: string | null;
  fetchShelters: () => Promise<void>;
  fetchShelter: (id: number) => Promise<void>;
  createShelter: (data: Partial<Shelter>) => Promise<Shelter>;
  updateShelter: (id: number, data: Partial<Shelter>) => Promise<Shelter>;
};

export const useShelterStore = create<ShelterState>((set) => ({
  shelters: [],
  shelter: null,
  loading: false,
  error: null,

  fetchShelters: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.SHELTERS);
      set({ shelters: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch shelters';
      set({ error: message, loading: false });
    }
  },

  fetchShelter: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.SHELTER_DETAIL(id));
      set({ shelter: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch shelter';
      set({ error: message, loading: false });
    }
  },

  createShelter: async (data: Partial<Shelter>) => {
    const response = await api.post(API_ENDPOINTS.SHELTER_CREATE, data);
    return response.data;
  },

  updateShelter: async (id: number, data: Partial<Shelter>) => {
    const response = await api.patch(API_ENDPOINTS.SHELTER_UPDATE(id), data);
    return response.data;
  },
}));
