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
  Container: ({ children, className }: any) =>
    React.createElement('div', { className }, children),
  EmptyState: ({ message }: any) =>
    React.createElement('div', { 'data-testid': 'empty-state' }, message),
  MultiSelectDropdown: ({ label, selected, onChange }: any) =>
    React.createElement('select', {
      'data-testid': `filter-${label}`,
      value: selected?.[0] || '',
      onChange: (e: any) => onChange(e.target.value ? [e.target.value] : []),
    },
      React.createElement('option', { value: '' }, label),
      React.createElement('option', { value: 'dog' }, 'Perros'),
    ),
  FAQAccordion: () => null,
}));

jest.mock('@/lib/hooks/useFAQs', () => ({
  useFAQsByTopic: () => ({ items: [], loading: false }),
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
    expect(screen.getByTestId('filter-Especies')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    setupMock({ loading: true });
    const { container } = render(<AnimalesPage />);
    const skeletons = container.querySelectorAll('.animate-shimmer');
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
    const speciesSelect = screen.getByTestId('filter-Especies');
    await userEvent.selectOptions(speciesSelect, 'dog');
    expect(state.setFilters).toHaveBeenCalled();
  });

  it('renders pagination when totalPages > 1', () => {
    const setPage = jest.fn();
    setupMock({
      animals: mockAnimals,
      loading: false,
      pagination: { page: 2, totalPages: 5, count: 50, pageSize: 10 },
      setPage,
    });
    render(<AnimalesPage />);
    // Page 2 button should be present (current page)
    expect(screen.getByText('2')).toBeInTheDocument();
    // Navigation buttons should exist
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
  });

  it('calls setPage when a pagination button is clicked', async () => {
    const setPage = jest.fn();
    setupMock({
      animals: mockAnimals,
      loading: false,
      pagination: { page: 2, totalPages: 5, count: 50, pageSize: 10 },
      setPage,
    });
    render(<AnimalesPage />);
    await userEvent.click(screen.getByText('3'));
    expect(setPage).toHaveBeenCalledWith(3);
  });

  it('does not render pagination when totalPages is 1', () => {
    setupMock({
      animals: mockAnimals,
      loading: false,
      pagination: { page: 1, totalPages: 1, count: 2, pageSize: 10 },
      setPage: jest.fn(),
    });
    render(<AnimalesPage />);
    // Only filter selects should be buttons, no pagination buttons for page numbers
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });
});
