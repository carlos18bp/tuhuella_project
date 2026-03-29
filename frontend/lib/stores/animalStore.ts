'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS, PAGINATION } from '@/lib/constants';
import type { Animal } from '@/lib/types';

type AnimalFilters = {
  species?: string;
  size?: string;
  age_range?: string;
  gender?: string;
  shelter?: number;
};

type PaginationState = {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type AnimalState = {
  animals: Animal[];
  animal: Animal | null;
  filters: AnimalFilters;
  pagination: PaginationState | null;
  loading: boolean;
  error: string | null;
  setFilters: (filters: AnimalFilters) => void;
  fetchAnimals: (filters?: AnimalFilters, lang?: string, page?: number) => Promise<void>;
  fetchAnimal: (id: number, lang?: string) => Promise<void>;
  createAnimal: (data: Partial<Animal>) => Promise<Animal>;
  updateAnimal: (id: number, data: Partial<Animal>) => Promise<Animal>;
  setPage: (page: number) => void;
};

export const useAnimalStore = create<AnimalState>((set, get) => ({
  animals: [],
  animal: null,
  filters: {},
  pagination: null,
  loading: false,
  error: null,

  setFilters: (filters: AnimalFilters) => set({ filters }),

  setPage: (page: number) => {
    const { filters, pagination } = get();
    const lang = undefined;
    get().fetchAnimals(filters, lang, page);
    if (pagination) {
      set({ pagination: { ...pagination, page } });
    }
  },

  fetchAnimals: async (filters?: AnimalFilters, lang?: string, page?: number) => {
    set({ loading: true, error: null });
    try {
      const params = {
        ...(filters ?? get().filters),
        ...(lang ? { lang } : {}),
        page: page ?? 1,
        page_size: PAGINATION.DEFAULT_PAGE_SIZE,
      };
      const response = await api.get(API_ENDPOINTS.ANIMALS, { params });
      set({
        animals: response.data.results,
        pagination: {
          count: response.data.count,
          page: response.data.page,
          pageSize: response.data.page_size,
          totalPages: response.data.total_pages,
        },
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch animals';
      set({ error: message, loading: false });
    }
  },

  fetchAnimal: async (id: number, lang?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.ANIMAL_DETAIL(id), {
        params: lang ? { lang } : {},
      });
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
