import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useFollowUpStore } from '../followUpStore';
import { api } from '../../services/http';
import type { PostAdoptionFollowUp } from '../../types';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const FOLLOW_UP_FIXTURE: PostAdoptionFollowUp = {
  id: 1,
  adoption_application: 5,
  animal: 7,
  animal_name: 'Luna',
  adopter: 10,
  status: 'pending',
  scheduled_date: '2026-05-01',
  notes: 'Doing well',
  assigned_veterinarian: null,
  completed_date: null,
  created_at: '2026-04-19T10:00:00Z',
};

describe('followUpStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFollowUpStore.setState({ items: [], detail: null, loading: false, error: null });
  });

  describe('fetchMine', () => {
    it('fetches follow-ups and stores them', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [FOLLOW_UP_FIXTURE] });

      await act(async () => {
        await useFollowUpStore.getState().fetchMine();
      });

      const state = useFollowUpStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].status).toBe('pending');
      expect(state.loading).toBe(false);
    });

    it('calls endpoint without query string when status is not provided', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });

      await act(async () => {
        await useFollowUpStore.getState().fetchMine();
      });

      expect(mockApi.get).toHaveBeenCalledWith('/follow-ups/');
    });

    it('appends encoded status query string when status is provided', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });

      await act(async () => {
        await useFollowUpStore.getState().fetchMine('in progress');
      });

      expect(mockApi.get).toHaveBeenCalledWith('/follow-ups/?status=in%20progress');
    });

    it('sets error when the API call fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Server error'));

      await act(async () => {
        await useFollowUpStore.getState().fetchMine();
      });

      const state = useFollowUpStore.getState();
      expect(state.error).toBe('Server error');
      expect(state.loading).toBe(false);
    });

    it('sets generic error string when rejection is not an Error instance', async () => {
      mockApi.get.mockRejectedValueOnce(42);

      await act(async () => {
        await useFollowUpStore.getState().fetchMine();
      });

      expect(useFollowUpStore.getState().error).toBe('Error');
    });
  });

  describe('fetchDetail', () => {
    it('fetches detail by id and stores it', async () => {
      mockApi.get.mockResolvedValueOnce({ data: FOLLOW_UP_FIXTURE });

      await act(async () => {
        await useFollowUpStore.getState().fetchDetail(1);
      });

      const state = useFollowUpStore.getState();
      expect(state.detail?.id).toBe(1);
      expect(state.loading).toBe(false);
    });

    it('calls the correct detail endpoint', async () => {
      mockApi.get.mockResolvedValueOnce({ data: FOLLOW_UP_FIXTURE });

      await act(async () => {
        await useFollowUpStore.getState().fetchDetail(1);
      });

      expect(mockApi.get).toHaveBeenCalledWith('/follow-ups/1/');
    });

    it('sets error when fetchDetail API call fails', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Not found'));

      await act(async () => {
        await useFollowUpStore.getState().fetchDetail(99);
      });

      const state = useFollowUpStore.getState();
      expect(state.error).toBe('Not found');
      expect(state.loading).toBe(false);
    });
  });

  describe('assignVet', () => {
    it('patches the assign endpoint and updates the matching item', async () => {
      const assigned: PostAdoptionFollowUp = { ...FOLLOW_UP_FIXTURE, assigned_veterinarian: 3 };
      useFollowUpStore.setState({ items: [FOLLOW_UP_FIXTURE] });
      mockApi.patch.mockResolvedValueOnce({ data: assigned });

      await act(async () => {
        await useFollowUpStore.getState().assignVet(1, 3);
      });

      expect(mockApi.patch).toHaveBeenCalledWith('/follow-ups/1/assign/', { veterinarian_id: 3 });
      const state = useFollowUpStore.getState();
      expect(state.items[0].assigned_veterinarian).toBe(3);
      expect(state.detail?.assigned_veterinarian).toBe(3);
    });
  });

  describe('markComplete', () => {
    it('patches the complete endpoint and updates the matching item', async () => {
      const completed: PostAdoptionFollowUp = {
        ...FOLLOW_UP_FIXTURE,
        status: 'completed',
        completed_date: '2026-04-19',
      };
      useFollowUpStore.setState({ items: [FOLLOW_UP_FIXTURE] });
      mockApi.patch.mockResolvedValueOnce({ data: completed });

      await act(async () => {
        await useFollowUpStore.getState().markComplete(1);
      });

      expect(mockApi.patch).toHaveBeenCalledWith('/follow-ups/1/complete/');
      const state = useFollowUpStore.getState();
      expect(state.items[0].status).toBe('completed');
      expect(state.detail?.status).toBe('completed');
    });
  });
});
