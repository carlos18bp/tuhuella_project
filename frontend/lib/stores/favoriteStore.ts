'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Favorite } from '@/lib/types';

type FavoriteState = {
  favorites: Favorite[];
  loading: boolean;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (animalId: number) => Promise<{ status: 'added' | 'removed' }>;
  isFavorited: (animalId: number) => boolean;
};

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  loading: false,

  fetchFavorites: async () => {
    set({ loading: true });
    try {
      const response = await api.get(API_ENDPOINTS.FAVORITES);
      set({ favorites: response.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  toggleFavorite: async (animalId: number) => {
    const response = await api.post(API_ENDPOINTS.FAVORITE_TOGGLE, { animal_id: animalId });
    await get().fetchFavorites();
    return response.data;
  },

  isFavorited: (animalId: number) => {
    return get().favorites.some((f) => f.animal === animalId);
  },
}));
