'use client';

import { create } from 'zustand';

import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { PostAdoptionFollowUp } from '@/lib/types';

type FollowUpState = {
  items: PostAdoptionFollowUp[];
  detail: PostAdoptionFollowUp | null;
  loading: boolean;
  error: string | null;
  fetchMine: (status?: string) => Promise<void>;
  fetchDetail: (id: number) => Promise<void>;
  assignVet: (id: number, veterinarianId: number) => Promise<void>;
  markComplete: (id: number) => Promise<void>;
};

export const useFollowUpStore = create<FollowUpState>((set, get) => ({
  items: [],
  detail: null,
  loading: false,
  error: null,

  fetchMine: async (status) => {
    set({ loading: true, error: null });
    try {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await api.get<PostAdoptionFollowUp[]>(`${API_ENDPOINTS.FOLLOW_UPS}${qs}`);
      set({ items: res.data, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      set({ loading: false, error: msg });
    }
  },

  fetchDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<PostAdoptionFollowUp>(API_ENDPOINTS.FOLLOW_UP_DETAIL(id));
      set({ detail: res.data, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      set({ loading: false, error: msg });
    }
  },

  assignVet: async (id, veterinarianId) => {
    const res = await api.patch<PostAdoptionFollowUp>(
      API_ENDPOINTS.FOLLOW_UP_ASSIGN(id),
      { veterinarian_id: veterinarianId },
    );
    const items = get().items.map((f) => (f.id === id ? res.data : f));
    set({ items, detail: res.data });
  },

  markComplete: async (id) => {
    const res = await api.patch<PostAdoptionFollowUp>(API_ENDPOINTS.FOLLOW_UP_COMPLETE(id));
    const items = get().items.map((f) => (f.id === id ? res.data : f));
    set({ items, detail: res.data });
  },
}));
