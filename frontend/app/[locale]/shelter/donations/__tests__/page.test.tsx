import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ShelterDonationsPage from '../page';
import { useDonationStore } from '@/lib/stores/donationStore';
import { mockDonations } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/donationStore', () => ({ useDonationStore: jest.fn() }));

const mockUseDonationStore = useDonationStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    donations: [],
    loading: false,
    fetchDonations: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockUseDonationStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('ShelterDonationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<ShelterDonationsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Donaciones Recibidas');
  });

  it('renders loading skeleton when loading', () => {
    setupMock({ loading: true });
    const { container } = render(<ShelterDonationsPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty message when no donations exist', () => {
    setupMock({ donations: [] });
    render(<ShelterDonationsPage />);
    expect(screen.getByText('No has recibido donaciones aún.')).toBeInTheDocument();
  });

  it('renders donation details when donations are loaded', () => {
    setupMock({ donations: mockDonations });
    render(<ShelterDonationsPage />);
    expect(screen.getByText('adopter@example.com')).toBeInTheDocument();
    expect(screen.getAllByText(/50,000/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders campaign name in donation', () => {
    setupMock({ donations: mockDonations });
    render(<ShelterDonationsPage />);
    expect(screen.getByText(/Fondo Médico de Emergencia/)).toBeInTheDocument();
  });

  it('renders total raised amount', () => {
    setupMock({ donations: mockDonations });
    render(<ShelterDonationsPage />);
    expect(screen.getByText(/Total recaudado/)).toBeInTheDocument();
  });

  it('renders donation message when present', () => {
    setupMock({ donations: mockDonations });
    render(<ShelterDonationsPage />);
    expect(screen.getByText(/Espero que esto ayude/)).toBeInTheDocument();
  });

  it('renders paid status badge', () => {
    setupMock({ donations: mockDonations });
    render(<ShelterDonationsPage />);
    expect(screen.getByText('Pagada')).toBeInTheDocument();
  });

  it('hides message when donation has no message', () => {
    const noMsg = [{ ...mockDonations[0], message: '' }];
    setupMock({ donations: noMsg });
    render(<ShelterDonationsPage />);
    expect(screen.queryByText(/Espero/)).not.toBeInTheDocument();
  });

  it('hides campaign when donation has no campaign', () => {
    const noCampaign = [{ ...mockDonations[0], campaign_title: null }];
    setupMock({ donations: noCampaign });
    render(<ShelterDonationsPage />);
    expect(screen.queryByText(/Campaña:/)).not.toBeInTheDocument();
  });

  it('shows raw status for non-paid donations', () => {
    const pending = [{ ...mockDonations[0], status: 'pending' }];
    setupMock({ donations: pending });
    render(<ShelterDonationsPage />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('calls fetchDonations on mount', () => {
    const state = setupMock();
    render(<ShelterDonationsPage />);
    expect(state.fetchDonations).toHaveBeenCalled();
  });
});
