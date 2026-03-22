'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Animal } from '@/lib/types';

type AnimalFilters = {
  species?: string;
  size?: string;
  age_range?: string;
  gender?: string;
  shelter?: number;
};

type AnimalState = {
  animals: Animal[];
  animal: Animal | null;
  filters: AnimalFilters;
  loading: boolean;
  error: string | null;
  setFilters: (filters: AnimalFilters) => void;
  fetchAnimals: (filters?: AnimalFilters) => Promise<void>;
  fetchAnimal: (id: number) => Promise<void>;
  createAnimal: (data: Partial<Animal>) => Promise<Animal>;
  updateAnimal: (id: number, data: Partial<Animal>) => Promise<Animal>;
};

export const useAnimalStore = create<AnimalState>((set, get) => ({
  animals: [],
  animal: null,
  filters: {},
  loading: false,
  error: null,

  setFilters: (filters: AnimalFilters) => set({ filters }),

  fetchAnimals: async (filters?: AnimalFilters) => {
    set({ loading: true, error: null });
    try {
      const params = filters ?? get().filters;
      const response = await api.get(API_ENDPOINTS.ANIMALS, { params });
      set({ animals: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch animals';
      set({ error: message, loading: false });
    }
  },

  fetchAnimal: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.ANIMAL_DETAIL(id));
      set({ animal: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch animal';
      set({ error: message, loading: false });
    }
  },

  createAnimal: async (data: Partial<Animal>) => {
    const response = await api.post(API_ENDPOINTS.ANIMAL_CREATE, data);
    return response.data;
  },

  updateAnimal: async (id: number, data: Partial<Animal>) => {
    const response = await api.patch(API_ENDPOINTS.ANIMAL_UPDATE(id), data);
    return response.data;
  },
}));
