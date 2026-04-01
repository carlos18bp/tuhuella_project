import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { act, render, screen, waitFor, within } from '@testing-library/react';

import { api } from '@/lib/services/http';
import { mockAnimals } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn() },
}));

jest.mock('@/components/ui/AnimalCard', () => ({
  __esModule: true,
  default: ({ animal }: any) => <div data-testid={`animal-card-${animal.id}`}>{animal.name}</div>,
}));

import SimilarAnimals from '../SimilarAnimals';

const mockApiGet = api.get as jest.Mock;

function mockMatchMedia(matches: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

/** Drena la microtarea del `.then` del `api.get` en el `useEffect` para evitar avisos de `act`. */
async function flushApiMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('SimilarAnimals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchMedia(false);
  });

  it('returns null when no similar animals loaded', async () => {
    mockApiGet.mockResolvedValue({ data: [] });
    const { container } = render(<SimilarAnimals animalId={1} />);
    await flushApiMicrotasks();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders section heading when animals loaded (mobile layout)', async () => {
    mockApiGet.mockResolvedValue({ data: mockAnimals.slice(0, 2) });
    render(<SimilarAnimals animalId={1} />);
    await flushApiMicrotasks();

    await waitFor(() => {
      const mobile = screen.getByTestId('similar-animals-mobile');
      expect(within(mobile).getByText('Luna')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('similar-animals-desktop')).not.toBeInTheDocument();
  });

  it('renders AnimalCard for each animal (mobile layout)', async () => {
    mockApiGet.mockResolvedValue({ data: mockAnimals.slice(0, 2) });
    render(<SimilarAnimals animalId={1} />);
    await flushApiMicrotasks();

    await waitFor(() => {
      const mobile = screen.getByTestId('similar-animals-mobile');
      expect(within(mobile).getByTestId('animal-card-1')).toBeInTheDocument();
      expect(within(mobile).getByTestId('animal-card-2')).toBeInTheDocument();
    });
  });

  it('renders grid only when matchMedia sm is true', async () => {
    mockMatchMedia(true);
    mockApiGet.mockResolvedValue({ data: mockAnimals.slice(0, 2) });
    render(<SimilarAnimals animalId={1} />);
    await flushApiMicrotasks();

    await waitFor(() => {
      const desktop = screen.getByTestId('similar-animals-desktop');
      expect(within(desktop).getByTestId('animal-card-1')).toBeInTheDocument();
      expect(within(desktop).getByTestId('animal-card-2')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('similar-animals-mobile')).not.toBeInTheDocument();
  });

  it('handles API error silently', async () => {
    mockApiGet.mockRejectedValue(new Error('Network error'));
    const { container } = render(<SimilarAnimals animalId={1} />);
    await flushApiMicrotasks();

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalled();
    });
    expect(container).toBeEmptyDOMElement();
  });
});
