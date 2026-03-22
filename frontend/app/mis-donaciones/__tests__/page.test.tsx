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
});
