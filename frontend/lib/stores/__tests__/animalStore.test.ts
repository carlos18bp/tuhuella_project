import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

import { useAnimalStore } from '../animalStore';
import { api } from '../../services/http';

jest.mock('../../services/http', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const ANIMAL_FIXTURE = {
  id: 1,
  name: 'Luna',
  species: 'dog',
  breed: 'Labrador',
  age_range: 'young',
  gender: 'female',
  size: 'medium',
  status: 'published',
};

describe('animalStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAnimalStore.setState({
      animals: [],
      animal: null,
      filters: {},
      loading: false,
      error: null,
    });
  });

  it('fetches animals list and stores them', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { results: [ANIMAL_FIXTURE], count: 1, page: 1, page_size: 20, total_pages: 1 },
    });

    await act(async () => {
      await useAnimalStore.getState().fetchAnimals();
    });

    const state = useAnimalStore.getState();
    expect(state.animals).toHaveLength(1);
    expect(state.animals[0].name).toBe('Luna');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets error when fetchAnimals fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useAnimalStore.getState().fetchAnimals();
    });

    const state = useAnimalStore.getState();
    expect(state.animals).toHaveLength(0);
    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });

  it('fetches a single animal detail', async () => {
    mockApi.get.mockResolvedValueOnce({ data: ANIMAL_FIXTURE });

    await act(async () => {
      await useAnimalStore.getState().fetchAnimal(1);
    });

    expect(useAnimalStore.getState().animal?.name).toBe('Luna');
  });

  it('passes filters to fetchAnimals', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { results: [], count: 0, page: 1, page_size: 20, total_pages: 0 },
    });
    const filters = { species: 'cat', size: 'small' };

    await act(async () => {
      await useAnimalStore.getState().fetchAnimals(filters);
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.any(String),
      { params: { ...filters, page: 1, page_size: 20 } },
    );
  });

  it('sets filters in state', () => {
    act(() => {
      useAnimalStore.getState().setFilters({ species: 'dog' });
    });

    expect(useAnimalStore.getState().filters).toEqual({ species: 'dog' });
  });

  it('creates an animal via API', async () => {
    mockApi.post.mockResolvedValueOnce({ data: ANIMAL_FIXTURE });

    const result = await useAnimalStore.getState().createAnimal({
      name: 'Luna',
      species: 'dog' as never,
    });

    expect(result.name).toBe('Luna');
    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it('sets fallback error when fetchAnimals rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useAnimalStore.getState().fetchAnimals();
    });

    expect(useAnimalStore.getState().error).toBe('Failed to fetch animals');
    expect(useAnimalStore.getState().loading).toBe(false);
  });

  it('sets fallback error when fetchAnimal rejects with non-Error', async () => {
    mockApi.get.mockRejectedValueOnce('string rejection');

    await act(async () => {
      await useAnimalStore.getState().fetchAnimal(1);
    });

    expect(useAnimalStore.getState().error).toBe('Failed to fetch animal');
    expect(useAnimalStore.getState().loading).toBe(false);
  });

  it('uses stored filters when fetchAnimals is called without args', async () => {
    useAnimalStore.setState({ filters: { species: 'cat' } });
    mockApi.get.mockResolvedValueOnce({
      data: { results: [], count: 0, page: 1, page_size: 20, total_pages: 0 },
    });

    await act(async () => {
      await useAnimalStore.getState().fetchAnimals();
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.any(String),
      { params: { species: 'cat', page: 1, page_size: 20 } },
    );
  });

  it('updates an animal via API', async () => {
    const updated = { ...ANIMAL_FIXTURE, name: 'Luna Updated' };
    mockApi.patch.mockResolvedValueOnce({ data: updated });

    const result = await useAnimalStore.getState().updateAnimal(1, { name: 'Luna Updated' });

    expect(result.name).toBe('Luna Updated');
    expect(mockApi.patch).toHaveBeenCalledTimes(1);
  });
});
