import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnimalesPage from '../page';
import { useAnimalStore } from '@/lib/stores/animalStore';
import { mockAnimals } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/stores/animalStore', () => ({
  useAnimalStore: jest.fn(),
}));

jest.mock('@/components/ui', () => ({
  AnimalCard: ({ animal }: any) =>
    React.createElement('div', { 'data-testid': `animal-card-${animal.id}` }, animal.name),
  EmptyState: ({ message }: any) =>
    React.createElement('div', { 'data-testid': 'empty-state' }, message),
}));

const mockUseAnimalStore = useAnimalStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    animals: [],
    loading: false,
    fetchAnimals: jest.fn(),
    setFilters: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseAnimalStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) => selector(state));
  return state;
};

describe('AnimalesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<AnimalesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Animales en adopción');
  });

  it('renders filter dropdowns', () => {
    setupMock();
    render(<AnimalesPage />);
    expect(screen.getByDisplayValue('Todas las especies')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Todos los tamaños')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Todas las edades')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    setupMock({ loading: true });
    const { container } = render(<AnimalesPage />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when no animals match filters', () => {
    setupMock({ animals: [], loading: false });
    render(<AnimalesPage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders animal cards when animals are loaded', () => {
    setupMock({ animals: mockAnimals, loading: false });
    render(<AnimalesPage />);
    expect(screen.getByTestId('animal-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('animal-card-2')).toBeInTheDocument();
  });

  it('calls fetchAnimals on mount', () => {
    const state = setupMock();
    render(<AnimalesPage />);
    expect(state.fetchAnimals).toHaveBeenCalled();
  });

  it('calls setFilters when species filter changes', async () => {
    const state = setupMock();
    render(<AnimalesPage />);
    const speciesSelect = screen.getByDisplayValue('Todas las especies');
    await userEvent.selectOptions(speciesSelect, 'dog');
    expect(state.setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when size filter changes', async () => {
    const state = setupMock();
    render(<AnimalesPage />);
    const sizeSelect = screen.getByDisplayValue('Todos los tamaños');
    await userEvent.selectOptions(sizeSelect, 'small');
    expect(state.setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when age filter changes', async () => {
    const state = setupMock();
    render(<AnimalesPage />);
    const ageSelect = screen.getByDisplayValue('Todas las edades');
    await userEvent.selectOptions(ageSelect, 'puppy');
    expect(state.setFilters).toHaveBeenCalled();
  });
});
