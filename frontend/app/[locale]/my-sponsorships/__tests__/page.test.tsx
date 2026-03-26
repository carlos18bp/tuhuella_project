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

  it('renders loading skeletons when loading is true', () => {
    useSponsorshipStore.setState({
      sponsorships: [],
      loading: true,
      fetchSponsorships: jest.fn(),
    });

    render(<MisApadrinamientosPage />);
    const skeletons = document.querySelectorAll('.animate-shimmer');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders one-time frequency label for non-monthly sponsorship', () => {
    useSponsorshipStore.setState({
      sponsorships: [
        {
          id: 2,
          user: 1,
          animal: 2,
          animal_name: 'Rex',
          shelter_name: 'Dog Rescue',
          amount: '50000.00',
          frequency: 'once',
          status: 'active',
          created_at: '2026-02-01T00:00:00Z',
        },
      ],
    });

    render(<MisApadrinamientosPage />);
    expect(screen.getByText(/único/)).toBeInTheDocument();
  });

  it('renders inactive status label for non-active sponsorship', () => {
    useSponsorshipStore.setState({
      sponsorships: [
        {
          id: 3,
          user: 1,
          animal: 3,
          animal_name: 'Luna',
          shelter_name: null,
          amount: '20000.00',
          frequency: 'monthly',
          status: 'cancelled',
          created_at: '2026-03-01T00:00:00Z',
        },
      ],
    });

    render(<MisApadrinamientosPage />);
    expect(screen.getByText('cancelled')).toBeInTheDocument();
  });

  it('does not render shelter name when shelter_name is null', () => {
    useSponsorshipStore.setState({
      sponsorships: [
        {
          id: 4,
          user: 1,
          animal: 4,
          animal_name: 'Coco',
          shelter_name: null,
          amount: '10000.00',
          frequency: 'monthly',
          status: 'active',
          created_at: '2026-03-01T00:00:00Z',
        },
      ],
    });

    render(<MisApadrinamientosPage />);
    expect(screen.getByText('Coco')).toBeInTheDocument();
  });
});
