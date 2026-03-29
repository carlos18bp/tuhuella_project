'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Favorite } from '@/lib/types';

type FavoriteState = {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (animalId: number) => Promise<{ status: 'added' | 'removed' }>;
  isFavorited: (animalId: number) => boolean;
  updateFavoriteNote: (favoriteId: number, note: string) => Promise<void>;
};

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,

  fetchFavorites: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.FAVORITES);
      set({ favorites: response.data, loading: false });
    } catch {
      set({ loading: false, error: 'Failed to load favorites' });
    }
  },

  toggleFavorite: async (animalId: number) => {
    const prev = get().favorites;
    const alreadyFav = prev.some((f) => f.animal === animalId);

    // Optimistic update
    if (alreadyFav) {
      set({ favorites: prev.filter((f) => f.animal !== animalId) });
    }

    try {
      const response = await api.post(API_ENDPOINTS.FAVORITE_TOGGLE, { animal_id: animalId });
      const { status: toggleStatus } = response.data;

      if (toggleStatus === 'added' && response.data.favorite) {
        // Use the full favorite object from the response instead of refetching
        set({ favorites: [response.data.favorite, ...prev] });
      }
      // If removed, the optimistic update already handled it

      return { status: toggleStatus };
    } catch (err) {
      set({ favorites: prev });
      throw err;
    }
  },

  isFavorited: (animalId: number) => {
    return get().favorites.some((f) => f.animal === animalId);
  },

  updateFavoriteNote: async (favoriteId: number, note: string) => {
    try {
      const response = await api.patch(API_ENDPOINTS.FAVORITE_UPDATE(favoriteId), { note });
      set({
        favorites: get().favorites.map((f) =>
          f.id === favoriteId ? response.data : f,
        ),
      });
    } catch {
      // Silent fail for note updates — non-critical
    }
  },
}));
