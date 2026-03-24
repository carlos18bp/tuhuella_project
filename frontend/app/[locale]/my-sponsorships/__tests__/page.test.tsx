import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { useSponsorshipStore } from '@/lib/stores/sponsorshipStore';

import MisApadrinamientosPage from '../page';

describe('MisApadrinamientosPage', () => {
  beforeEach(() => {
    useSponsorshipStore.setState({
      sponsorships: [],
      loading: false,
      error: null,
      fetchSponsorships: jest.fn(),
    });
  });

  it('renders page title', () => {
    render(<MisApadrinamientosPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mis Apadrinamientos');
  });

  it('renders empty state when no sponsorships', () => {
    render(<MisApadrinamientosPage />);
    expect(screen.getByText('No tienes apadrinamientos activos.')).toBeInTheDocument();
  });

  it('renders sponsorship list when sponsorships exist', () => {
    useSponsorshipStore.setState({
      sponsorships: [
        {
          id: 1,
          user: 1,
          animal: 1,
          animal_name: 'Milo',
          shelter_name: 'Cat Haven',
          amount: '30000.00',
          frequency: 'monthly',
          status: 'active',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    });

    render(<MisApadrinamientosPage />);
    expect(screen.getByText('Milo')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Cat Haven')).toBeInTheDocument();
  });
});
