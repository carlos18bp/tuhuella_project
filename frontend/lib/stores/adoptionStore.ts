'use client';

import { create } from 'zustand';
import { api } from '@/lib/services/http';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  AdoptionApplication,
  AdoptionApplicationEvent,
  AdoptionApplicationStatus,
} from '@/lib/types';

type EventInput = { event_date: string; description: string };

const FOLLOW_UP_INTERVAL_DAYS = 5;
const followUpFromNow = (): string =>
  new Date(Date.now() + FOLLOW_UP_INTERVAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

type AdoptionState = {
  applications: AdoptionApplication[];
  applicationsById: Record<number, AdoptionApplication>;
  loading: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  fetchApplication: (id: number) => Promise<AdoptionApplication>;
  createApplication: (data: {
    animal: number;
    form_answers: Record<string, unknown>;
    notes?: string;
  }) => Promise<AdoptionApplication>;
  updateStatus: (id: number, status: AdoptionApplicationStatus) => Promise<AdoptionApplication>;
  createEvent: (applicationId: number, payload: EventInput) => Promise<AdoptionApplicationEvent>;
  updateEvent: (
    applicationId: number,
    eventId: number,
    payload: Partial<EventInput>,
  ) => Promise<AdoptionApplicationEvent>;
  archiveEvent: (applicationId: number, eventId: number) => Promise<void>;
};

export const useAdoptionStore = create<AdoptionState>((set, get) => ({
  applications: [],
  applicationsById: {},
  loading: false,
  error: null,

  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<AdoptionApplication[]>(API_ENDPOINTS.ADOPTIONS);
      set({ applications: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch applications';
      set({ error: message, loading: false });
    }
  },

  fetchApplication: async (id: number) => {
    const response = await api.get<AdoptionApplication>(API_ENDPOINTS.ADOPTION_DETAIL(id));
    set((state) => ({
      applicationsById: { ...state.applicationsById, [id]: response.data },
    }));
    return response.data;
  },

  createApplication: async (data) => {
    const response = await api.post<AdoptionApplication>(API_ENDPOINTS.ADOPTION_CREATE, data);
    return response.data;
  },

  updateStatus: async (id: number, status: AdoptionApplicationStatus) => {
    const response = await api.patch<AdoptionApplication>(
      API_ENDPOINTS.ADOPTION_UPDATE_STATUS(id),
      { status },
    );
    set((state) => ({
      applicationsById: { ...state.applicationsById, [id]: response.data },
      applications: state.applications.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
    return response.data;
  },

  createEvent: async (applicationId, payload) => {
    const response = await api.post<AdoptionApplicationEvent>(
      API_ENDPOINTS.ADOPTION_EVENTS(applicationId),
      payload,
    );
    const cached = get().applicationsById[applicationId];
    if (cached) {
      const events = [response.data, ...(cached.events ?? [])];
      set((state) => ({
        applicationsById: {
          ...state.applicationsById,
          [applicationId]: {
            ...cached,
            events,
            next_follow_up_due_at: followUpFromNow(),
          },
        },
      }));
    }
    return response.data;
  },

  updateEvent: async (applicationId, eventId, payload) => {
    const response = await api.patch<AdoptionApplicationEvent>(
      API_ENDPOINTS.ADOPTION_EVENT_DETAIL(applicationId, eventId),
      payload,
    );
    const cached = get().applicationsById[applicationId];
    if (cached) {
      const events = (cached.events ?? []).map((e) => (e.id === eventId ? response.data : e));
      set((state) => ({
        applicationsById: {
          ...state.applicationsById,
          [applicationId]: { ...cached, events },
        },
      }));
    }
    return response.data;
  },

  archiveEvent: async (applicationId, eventId) => {
    await api.delete(API_ENDPOINTS.ADOPTION_EVENT_DETAIL(applicationId, eventId));
    const cached = get().applicationsById[applicationId];
    if (cached) {
      const events = (cached.events ?? []).filter((e) => e.id !== eventId);
      set((state) => ({
        applicationsById: {
          ...state.applicationsById,
          [applicationId]: { ...cached, events },
        },
      }));
    }
  },
}));
