import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useClinicalHistoryStore } from '../clinicalHistoryStore';
import { api } from '../../services/http';
import type { ClinicalHistoryEntry, ClinicalEntryPayload } from '../../types';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const ENTRY_FIXTURE: ClinicalHistoryEntry = {
  id: 1,
  animal: 7,
  entry_type: 'checkup',
  title: 'Routine checkup',
  body_es: 'Todo bien',
  body_en: 'All good',
  occurred_at: '2026-01-10T10:00:00Z',
  author: 2,
  created_at: '2026-01-10T10:05:00Z',
};

const ENTRY_PAYLOAD: ClinicalEntryPayload = {
  entry_type: 'treatment',
  title: 'Injured paw',
  body_es: 'Reposo',
  body_en: 'Rest',
  occurred_at: '2026-02-01T09:00:00Z',
};

describe('clinicalHistoryStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useClinicalHistoryStore.setState({ entries: [], loading: false, error: null });
  });

  describe('setEntries', () => {
    it('synchronously replaces the entries array', () => {
      useClinicalHistoryStore.getState().setEntries([ENTRY_FIXTURE]);

      expect(useClinicalHistoryStore.getState().entries).toHaveLength(1);
      expect(useClinicalHistoryStore.getState().entries[0].id).toBe(1);
    });
  });

  describe('fetchForAnimal', () => {
    it('fetches entries for the given animal and stores them', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [ENTRY_FIXTURE] });

      await act(async () => {
        await useClinicalHistoryStore.getState().fetchForAnimal(7);
      });

      const state = useClinicalHistoryStore.getState();
      expect(state.entries).toHaveLength(1);
      expect(state.entries[0].title).toBe('Routine checkup');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('calls the correct endpoint for the given animal id', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });

      await act(async () => {
        await useClinicalHistoryStore.getState().fetchForAnimal(7);
      });

      expect(mockApi.get).toHaveBeenCalledWith('/animals/7/clinical-history/');
    });

    it('sets error message when the API call fails with an Error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await useClinicalHistoryStore.getState().fetchForAnimal(7);
      });

      const state = useClinicalHistoryStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.loading).toBe(false);
    });

    it('sets generic error string when rejection is not an Error instance', async () => {
      mockApi.get.mockRejectedValueOnce('string rejection');

      await act(async () => {
        await useClinicalHistoryStore.getState().fetchForAnimal(7);
      });

      expect(useClinicalHistoryStore.getState().error).toBe('Error');
    });
  });

  describe('addEntry', () => {
    it('prepends the new entry to the existing entries list', async () => {
      useClinicalHistoryStore.setState({ entries: [ENTRY_FIXTURE] });
      const newEntry: ClinicalHistoryEntry = { ...ENTRY_FIXTURE, id: 2, title: 'Injured paw' };
      mockApi.post.mockResolvedValueOnce({ data: newEntry });

      await act(async () => {
        await useClinicalHistoryStore.getState().addEntry(7, ENTRY_PAYLOAD);
      });

      const { entries } = useClinicalHistoryStore.getState();
      expect(entries).toHaveLength(2);
      expect(entries[0].id).toBe(2);
    });

    it('returns the newly created entry', async () => {
      const newEntry: ClinicalHistoryEntry = { ...ENTRY_FIXTURE, id: 3 };
      mockApi.post.mockResolvedValueOnce({ data: newEntry });

      let result: ClinicalHistoryEntry | undefined;
      await act(async () => {
        result = await useClinicalHistoryStore.getState().addEntry(7, ENTRY_PAYLOAD);
      });

      expect(result?.id).toBe(3);
    });

    it('calls the correct create endpoint for the given animal id', async () => {
      mockApi.post.mockResolvedValueOnce({ data: ENTRY_FIXTURE });

      await act(async () => {
        await useClinicalHistoryStore.getState().addEntry(7, ENTRY_PAYLOAD);
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/animals/7/clinical-history/create/',
        expect.any(Object),
      );
    });
  });
});
