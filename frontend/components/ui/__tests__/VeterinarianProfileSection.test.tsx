import React from 'react';
import { render, screen } from '@testing-library/react';

import VeterinarianProfileSection from '../VeterinarianProfileSection';
import { useFollowUpStore } from '@/lib/stores/followUpStore';

const mockFetchMine = jest.fn();

const resetStore = (overrides = {}) => {
  useFollowUpStore.setState({
    items: [],
    detail: null,
    loading: false,
    error: null,
    fetchMine: mockFetchMine,
    ...overrides,
  });
};

describe('VeterinarianProfileSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  it('renders the follow-ups title', () => {
    render(<VeterinarianProfileSection />);
    // followUpsTitle is rendered exactly twice: the section h2 and the quick-action link label.
    // A >=1 check would still pass if either one silently disappeared.
    expect(screen.getAllByText('Seguimientos asignados')).toHaveLength(2);
  });

  it('calls fetchMine on mount when items are empty and not loading', () => {
    render(<VeterinarianProfileSection />);
    expect(mockFetchMine).toHaveBeenCalledTimes(1);
  });

  it('does not call fetchMine when items already exist', () => {
    resetStore({
      items: [
        { id: 1, status: 'pending', animal: { name: 'Rex' }, adopter: {}, assigned_vet: null, due_date: null, completed_at: null, created_at: '', clinical_entries: [] },
      ],
    });
    render(<VeterinarianProfileSection />);
    // quality: allow-mock-only (absence of the call IS the contract; nothing observable to assert)
    expect(mockFetchMine).not.toHaveBeenCalled();
    // Proves the seeded pending item was actually bucketed into the "Pendiente" stat card, not just that
    // fetchMine was skipped — a mis-bucketed status would leave this card at 0 while the test above still passes.
    expect(screen.getByText('Pendiente').closest('div')).toHaveTextContent('1');
  });

  it('does not call fetchMine when already loading', () => {
    resetStore({ loading: true });
    render(<VeterinarianProfileSection />);
    expect(mockFetchMine).not.toHaveBeenCalled();
    // Proves the stat grid still mounted under the early-return guard, not just that fetchMine was skipped.
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('shows empty state message when no items and not loading', () => {
    render(<VeterinarianProfileSection />);
    expect(screen.getByText('No tienes seguimientos asignados todavía.')).toBeInTheDocument();
  });

  it('does not show empty state when items exist', () => {
    resetStore({
      items: [
        { id: 1, status: 'in_progress', animal: { name: 'Luna' }, adopter: {}, assigned_vet: null, due_date: null, completed_at: null, created_at: '', clinical_entries: [] },
      ],
    });
    render(<VeterinarianProfileSection />);
    expect(screen.queryByText('No tienes seguimientos asignados')).not.toBeInTheDocument();
    // Proves the seeded in_progress item was actually bucketed into the "En curso" stat card, not just
    // that the empty-state message was skipped — a mis-bucketed status would leave this card at 0 while
    // this test would still wrongly pass without it.
    expect(screen.getByText('En curso').closest('div')).toHaveTextContent('1');
  });

  it('renders 4 stat cards', () => {
    render(<VeterinarianProfileSection />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
    expect(screen.getByText('Vencido')).toBeInTheDocument();
  });

  it('counts status correctly from store items', () => {
    resetStore({
      items: [
        { id: 1, status: 'pending', animal: {}, adopter: {}, assigned_vet: null, due_date: null, completed_at: null, created_at: '', clinical_entries: [] },
        { id: 2, status: 'pending', animal: {}, adopter: {}, assigned_vet: null, due_date: null, completed_at: null, created_at: '', clinical_entries: [] },
        { id: 3, status: 'completed', animal: {}, adopter: {}, assigned_vet: null, due_date: null, completed_at: null, created_at: '', clinical_entries: [] },
      ],
    });
    render(<VeterinarianProfileSection />);
    // Scoped to each stat card so a mis-bucketed status (e.g. pending counted into "Completado")
    // fails here even though an unscoped `getAllByText('2')` count would not catch it.
    expect(screen.getByText('Pendiente').closest('div')).toHaveTextContent('2');
    expect(screen.getByText('Completado').closest('div')).toHaveTextContent('1');
  });

  it('renders the quick actions section', () => {
    render(<VeterinarianProfileSection />);
    expect(screen.getByText('Acciones rápidas')).toBeInTheDocument();
  });

  it('renders a link to the follow-ups list', () => {
    render(<VeterinarianProfileSection />);
    // Pins the actual destination — a >=1 length check never verifies the href, so a broken/typo'd
    // route would still pass.
    expect(screen.getByRole('link')).toHaveAttribute('href', '/veterinarian/follow-ups');
  });
});
