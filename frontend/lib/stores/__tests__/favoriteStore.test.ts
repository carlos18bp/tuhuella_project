import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useFavoriteStore } from '../favoriteStore';
import { api } from '../../services/http';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const FAVORITE_FIXTURE = {
  id: 1,
  animal: 10,
  animal_name: 'Luna',
  animal_species: 'dog',
  shelter_name: 'Happy Paws',
};

describe('favoriteStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFavoriteStore.setState({
      favorites: [],
      loading: false,
    });
  });

  it('fetches favorites list and stores them', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [FAVORITE_FIXTURE] });

    await act(async () => {
      await useFavoriteStore.getState().fetchFavorites();
    });

    const state = useFavoriteStore.getState();
    expect(state.favorites).toHaveLength(1);
    expect(state.favorites[0].animal).toBe(10);
    expect(state.loading).toBe(false);
  });

  it('handles fetchFavorites failure gracefully', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useFavoriteStore.getState().fetchFavorites();
    });

    expect(useFavoriteStore.getState().favorites).toHaveLength(0);
    expect(useFavoriteStore.getState().loading).toBe(false);
  });

  it('toggles favorite to add', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { status: 'added', animal_id: 10 } });
    mockApi.get.mockResolvedValueOnce({ data: [FAVORITE_FIXTURE] });

    const result = await useFavoriteStore.getState().toggleFavorite(10);

    expect(result.status).toBe('added');
    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it('toggles favorite to remove', async () => {
    useFavoriteStore.setState({ favorites: [FAVORITE_FIXTURE as never] });
    mockApi.post.mockResolvedValueOnce({ data: { status: 'removed', animal_id: 10 } });
    mockApi.get.mockResolvedValueOnce({ data: [] });

    const result = await useFavoriteStore.getState().toggleFavorite(10);

    expect(result.status).toBe('removed');
  });

  it('reports whether an animal is favorited', () => {
    useFavoriteStore.setState({ favorites: [FAVORITE_FIXTURE as never] });

    expect(useFavoriteStore.getState().isFavorited(10)).toBe(true);
    expect(useFavoriteStore.getState().isFavorited(999)).toBe(false);
  });

  it('updates favorite note on success', async () => {
    const updated = { ...FAVORITE_FIXTURE, note: 'great dog' };
    useFavoriteStore.setState({ favorites: [FAVORITE_FIXTURE as never] });
    mockApi.patch.mockResolvedValueOnce({ data: updated });

    await act(async () => {
      await useFavoriteStore.getState().updateFavoriteNote(1, 'great dog');
    });

    expect(useFavoriteStore.getState().favorites[0]).toEqual(updated);
  });

  it('handles updateFavoriteNote failure silently', async () => {
    useFavoriteStore.setState({ favorites: [FAVORITE_FIXTURE as never] });
    mockApi.patch.mockRejectedValueOnce(new Error('fail'));

    await act(async () => {
      await useFavoriteStore.getState().updateFavoriteNote(1, 'test');
    });

    // Favorites remain unchanged
    expect(useFavoriteStore.getState().favorites[0]).toEqual(FAVORITE_FIXTURE);
  });

  it('rolls back favorites on toggleFavorite error', async () => {
    useFavoriteStore.setState({ favorites: [FAVORITE_FIXTURE as never] });
    mockApi.post.mockRejectedValueOnce(new Error('fail'));

    await expect(
      useFavoriteStore.getState().toggleFavorite(10),
    ).rejects.toThrow('fail');

    // Favorites should be restored to original
    expect(useFavoriteStore.getState().favorites).toHaveLength(1);
    expect(useFavoriteStore.getState().favorites[0].animal).toBe(10);
  });
});
