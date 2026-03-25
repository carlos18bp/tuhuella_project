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
    const prev = get().favorites;
    const alreadyFav = prev.some((f) => f.animal === animalId);

    // Optimistic update
    if (alreadyFav) {
      set({ favorites: prev.filter((f) => f.animal !== animalId) });
    } else {
      set({
        favorites: [
          ...prev,
          { id: -1, animal: animalId, animal_name: '', animal_species: 'dog', shelter_name: '', created_at: '' } as Favorite,
        ],
      });
    }

    try {
      const response = await api.post(API_ENDPOINTS.FAVORITE_TOGGLE, { animal_id: animalId });
      await get().fetchFavorites();
      return response.data;
    } catch (err) {
      set({ favorites: prev });
      throw err;
    }
  },

  isFavorited: (animalId: number) => {
    return get().favorites.some((f) => f.animal === animalId);
  },
}));
