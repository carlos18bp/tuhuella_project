import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useShelterStore } from '../shelterStore';
import { api } from '../../services/http';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const SHELTER_FIXTURE = {
  id: 1,
  name: 'Happy Paws',
  city: 'Bogotá',
  verification_status: 'verified',
};

describe('shelterStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useShelterStore.setState({
      shelters: [],
      shelter: null,
      loading: false,
      error: null,
    });
  });

  it('fetches shelters list and stores them', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [SHELTER_FIXTURE] });

    await act(async () => {
      await useShelterStore.getState().fetchShelters();
    });

    const state = useShelterStore.getState();
    expect(state.shelters).toHaveLength(1);
    expect(state.shelters[0].name).toBe('Happy Paws');
    expect(state.loading).toBe(false);
  });

  it('sets error when fetchShelters fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useShelterStore.getState().fetchShelters();
    });

    expect(useShelterStore.getState().error).toBe('Network error');
    expect(useShelterStore.getState().loading).toBe(false);
  });

  it('fetches a single shelter detail', async () => {
    mockApi.get.mockResolvedValueOnce({ data: SHELTER_FIXTURE });

    await act(async () => {
      await useShelterStore.getState().fetchShelter(1);
    });

    expect(useShelterStore.getState().shelter?.name).toBe('Happy Paws');
  });

  it('sets fallback error when fetchShelters rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useShelterStore.getState().fetchShelters();
    });

    expect(useShelterStore.getState().error).toBe('Failed to fetch shelters');
    expect(useShelterStore.getState().loading).toBe(false);
  });

  it('sets error when fetchShelter fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Not found'));

    await act(async () => {
      await useShelterStore.getState().fetchShelter(999);
    });

    expect(useShelterStore.getState().error).toBe('Not found');
    expect(useShelterStore.getState().loading).toBe(false);
  });

  it('sets fallback error when fetchShelter rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useShelterStore.getState().fetchShelter(1);
    });

    expect(useShelterStore.getState().error).toBe('Failed to fetch shelter');
    expect(useShelterStore.getState().loading).toBe(false);
  });

  it('creates a shelter via API', async () => {
    mockApi.post.mockResolvedValueOnce({ data: SHELTER_FIXTURE });

    const result = await useShelterStore.getState().createShelter({
      name: 'Happy Paws',
      city: 'Bogotá',
    });

    expect(result.name).toBe('Happy Paws');
    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it('updates a shelter via API', async () => {
    const updated = { ...SHELTER_FIXTURE, name: 'Updated Paws' };
    mockApi.patch.mockResolvedValueOnce({ data: updated });

    const result = await useShelterStore.getState().updateShelter(1, { name: 'Updated Paws' });

    expect(result.name).toBe('Updated Paws');
    expect(mockApi.patch).toHaveBeenCalledTimes(1);
  });
});
