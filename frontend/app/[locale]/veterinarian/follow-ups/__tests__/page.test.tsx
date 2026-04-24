import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import VeterinarianFollowUpsPage from '../page';
import { useFollowUpStore } from '@/lib/stores/followUpStore';

jest.mock('@/lib/stores/followUpStore', () => ({ useFollowUpStore: jest.fn() }));

const mockUseFollowUpStore = useFollowUpStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    items: [],
    loading: false,
    fetchMine: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseFollowUpStore.mockImplementation((sel: any) => sel(state));
  return state;
};

const mockFollowUps = [
  { id: 1, animal_name: 'Luna', scheduled_date: '2026-05-01', status: 'pending' },
  { id: 2, animal_name: 'Rocky', scheduled_date: '2026-05-10', status: 'completed' },
];

describe('VeterinarianFollowUpsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<VeterinarianFollowUpsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    setupMock({ loading: true });
    render(<VeterinarianFollowUpsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no follow-ups', () => {
    setupMock({ items: [] });
    render(<VeterinarianFollowUpsPage />);
    expect(screen.getByText('No tienes seguimientos asignados todavía.')).toBeInTheDocument();
  });

  it('renders follow-up items', () => {
    setupMock({ items: mockFollowUps });
    render(<VeterinarianFollowUpsPage />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Rocky')).toBeInTheDocument();
  });

  it('renders status badges', () => {
    setupMock({ items: mockFollowUps });
    render(<VeterinarianFollowUpsPage />);
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('calls fetchMine on mount', () => {
    const state = setupMock();
    render(<VeterinarianFollowUpsPage />);
    expect(state.fetchMine).toHaveBeenCalled();
  });
});
