import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';

import { useFAQsByTopic, useAllFAQs } from '../useFAQs';
import { api } from '../../services/http';

jest.mock('../../services/http', () => ({
  api: { get: jest.fn() },
}));

const mockApiGet = api.get as jest.Mock;

describe('useFAQsByTopic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns items on success', async () => {
    const fakeItems = [
      { id: 1, question: '¿Cómo adopto?', answer: 'Primero regístrate.' },
      { id: 2, question: '¿Cuánto cuesta?', answer: 'Es gratis.' },
    ];
    mockApiGet.mockResolvedValueOnce({ data: { items: fakeItems } });

    const { result } = renderHook(() => useFAQsByTopic('adoption'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual(fakeItems);
    expect(mockApiGet).toHaveBeenCalledWith(
      '/faqs/adoption/',
      { params: { lang: 'es' } }
    );
  });

  it('returns empty array on error', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useFAQsByTopic('adoption'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual([]);
  });

  it('sets loading to false after fetch', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { items: [] } });

    const { result } = renderHook(() => useFAQsByTopic('general'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});

describe('useAllFAQs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns topics on success', async () => {
    const fakeTopics = [
      { id: 1, slug: 'adoption', display_name: 'Adopción', items: [] },
      { id: 2, slug: 'general', display_name: 'General', items: [] },
    ];
    mockApiGet.mockResolvedValueOnce({ data: fakeTopics });

    const { result } = renderHook(() => useAllFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.topics).toEqual(fakeTopics);
    expect(mockApiGet).toHaveBeenCalledWith(
      '/faqs/',
      { params: { lang: 'es' } }
    );
  });

  it('returns empty array on error', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAllFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.topics).toEqual([]);
  });

  it('sets loading to false after fetch', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useAllFAQs());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
