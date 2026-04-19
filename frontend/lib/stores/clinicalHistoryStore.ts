'use client';

import { create } from 'zustand';

import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type { ClinicalHistoryEntry, ClinicalEntryPayload } from '@/lib/types';

type ClinicalHistoryState = {
  entries: ClinicalHistoryEntry[];
  loading: boolean;
  error: string | null;
  setEntries: (entries: ClinicalHistoryEntry[]) => void;
  fetchForAnimal: (animalId: number) => Promise<void>;
  addEntry: (animalId: number, payload: ClinicalEntryPayload) => Promise<ClinicalHistoryEntry>;
};

export const useClinicalHistoryStore = create<ClinicalHistoryState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  setEntries: (entries) => set({ entries }),

  fetchForAnimal: async (animalId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<ClinicalHistoryEntry[]>(API_ENDPOINTS.ANIMAL_CLINICAL_HISTORY(animalId));
      set({ entries: res.data, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      set({ loading: false, error: msg });
    }
  },

  addEntry: async (animalId, payload) => {
    const res = await api.post<ClinicalHistoryEntry>(
      API_ENDPOINTS.ANIMAL_CLINICAL_HISTORY_CREATE(animalId),
      payload,
    );
    set({ entries: [res.data, ...get().entries] });
    return res.data;
  },
}));
