import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { useDonationStore } from '@/lib/stores/donationStore';

import MisDonacionesPage from '../page';

describe('MisDonacionesPage', () => {
  beforeEach(() => {
    useDonationStore.setState({
      donations: [],
      loading: false,
      error: null,
      fetchDonations: jest.fn(),
    });
  });

  it('renders page title', () => {
    render(<MisDonacionesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mis Donaciones');
  });

  it('renders empty state when no donations', () => {
    render(<MisDonacionesPage />);
    expect(screen.getByText('No tienes donaciones registradas.')).toBeInTheDocument();
  });

  it('renders donation list when donations exist', () => {
    useDonationStore.setState({
      donations: [
        {
          id: 1,
          user: 1,
          user_email: 'test@example.com',
          amount: '50000.00',
          status: 'paid',
          created_at: '2026-01-15T00:00:00Z',
          campaign_title: 'Medical Fund',
          shelter_name: 'Patitas',
        },
      ],
    });

    render(<MisDonacionesPage />);
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
    expect(screen.getByText('Pagada')).toBeInTheDocument();
    expect(screen.getByText('Medical Fund')).toBeInTheDocument();
  });

  it('renders loading skeletons when loading is true', () => {
    useDonationStore.setState({
      donations: [],
      loading: true,
      fetchDonations: jest.fn(),
    });

    render(<MisDonacionesPage />);
    const skeletons = document.querySelectorAll('.animate-shimmer');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders pending status as raw value for non-paid donation', () => {
    useDonationStore.setState({
      donations: [
        {
          id: 2,
          user: 1,
          user_email: 'test@example.com',
          amount: '20000.00',
          status: 'pending',
          created_at: '2026-02-01T00:00:00Z',
          campaign_title: null,
          shelter_name: null,
        },
      ],
    });

    render(<MisDonacionesPage />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders donation without campaign title when campaign_title is null', () => {
    useDonationStore.setState({
      donations: [
        {
          id: 3,
          user: 1,
          user_email: 'test@example.com',
          amount: '15000.00',
          status: 'paid',
          created_at: '2026-02-10T00:00:00Z',
          campaign_title: null,
          shelter_name: 'Hogar Animal',
        },
      ],
    });

    render(<MisDonacionesPage />);
    expect(screen.getByText('Hogar Animal')).toBeInTheDocument();
    expect(screen.queryByText(/null/)).not.toBeInTheDocument();
  });

  it('renders donation without shelter name when shelter_name is null', () => {
    useDonationStore.setState({
      donations: [
        {
          id: 4,
          user: 1,
          user_email: 'test@example.com',
          amount: '10000.00',
          status: 'paid',
          created_at: '2026-03-01T00:00:00Z',
          campaign_title: 'Vacunación',
          shelter_name: null,
        },
      ],
    });

    render(<MisDonacionesPage />);
    expect(screen.getByText('Vacunación')).toBeInTheDocument();
  });
});
