import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

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

describe('SimilarAnimals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no similar animals loaded', () => {
    mockApiGet.mockResolvedValue({ data: [] });
    const { container } = render(<SimilarAnimals animalId={1} />);
    // Initially empty since animals state is []
    expect(container.querySelector('section')).toBeNull();
  });

  it('renders section heading when animals loaded', async () => {
    mockApiGet.mockResolvedValue({ data: mockAnimals.slice(0, 2) });
    render(<SimilarAnimals animalId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });
  });

  it('renders AnimalCard for each animal', async () => {
    mockApiGet.mockResolvedValue({ data: mockAnimals.slice(0, 2) });
    render(<SimilarAnimals animalId={1} />);

    await waitFor(() => {
      expect(screen.getByTestId('animal-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('animal-card-2')).toBeInTheDocument();
    });
  });

  it('handles API error silently', async () => {
    mockApiGet.mockRejectedValue(new Error('Network error'));
    const { container } = render(<SimilarAnimals animalId={1} />);

    // Should remain empty after error
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalled();
    });
    expect(container.querySelector('section')).toBeNull();
  });
});
