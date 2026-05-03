'use client';

import axios from 'axios';
import { create } from 'zustand';

import { API_ENDPOINTS } from '@/lib/constants';
import { api } from '@/lib/services/http';

export type ShelterApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type ShelterApplication = {
  id: number;
  shelter_name: string;
  description_es: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  legal_name: string;
  tax_id: string;
  legal_representative_name: string;
  legal_representative_id: string;
  motivation: string;
  previous_experience: string;
  capacity_estimate: number | null;
  status: ShelterApplicationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string;
  created_shelter_id: number | null;
  document_urls: string[];
};

export type ShelterApplicationPayload = {
  shelter_name: string;
  description_es: string;
  city: string;
  address?: string;
  phone: string;
  email?: string;
  website?: string;
  legal_name: string;
  tax_id: string;
  legal_representative_name: string;
  legal_representative_id: string;
  motivation: string;
  previous_experience?: string;
  capacity_estimate?: number | null;
};

type State = {
  application: ShelterApplication | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchMine: () => Promise<void>;
  submit: (payload: ShelterApplicationPayload) => Promise<ShelterApplication>;
  reset: () => void;
};

export const useShelterApplicationStore = create<State>((set) => ({
  application: null,
  loading: false,
  submitting: false,
  error: null,

  fetchMine: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<ShelterApplication>(API_ENDPOINTS.SHELTER_APPLICATION_MINE);
      set({ application: response.data, loading: false });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        set({ application: null, loading: false });
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to fetch shelter application';
      set({ error: message, loading: false });
    }
  },

  submit: async (payload) => {
    set({ submitting: true, error: null });
    try {
      const response = await api.post<ShelterApplication>(
        API_ENDPOINTS.SHELTER_APPLICATIONS,
        payload,
      );
      set({ application: response.data, submitting: false });
      return response.data;
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data
          ? JSON.stringify(err.response.data)
          : err instanceof Error
            ? err.message
            : 'Failed to submit application';
      set({ error: message, submitting: false });
      throw err;
    }
  },

  reset: () => set({ application: null, error: null, loading: false, submitting: false }),
}));
