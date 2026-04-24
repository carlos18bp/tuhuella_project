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
    expect(screen.getAllByText('Seguimientos asignados').length).toBeGreaterThanOrEqual(1);
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
    expect(mockFetchMine).not.toHaveBeenCalled();
  });

  it('does not call fetchMine when already loading', () => {
    resetStore({ loading: true });
    render(<VeterinarianProfileSection />);
    expect(mockFetchMine).not.toHaveBeenCalled();
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
    // Verify counts rendered — pending=2 at index, completed=1
    // Use textContent since they are plain text nodes in <p>
    const allTwos = screen.getAllByText('2');
    expect(allTwos.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders the quick actions section', () => {
    render(<VeterinarianProfileSection />);
    expect(screen.getByText('Acciones rápidas')).toBeInTheDocument();
  });

  it('renders a link to the follow-ups list', () => {
    render(<VeterinarianProfileSection />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});
