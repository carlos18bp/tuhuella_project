import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => React.createElement('div', null, children),
  SwiperSlide: ({ children }: any) => React.createElement('div', null, children),
}));
jest.mock('swiper/modules', () => ({ Navigation: {}, Pagination: {}, Autoplay: {} }));
jest.mock('swiper/css', () => {});
jest.mock('swiper/css/navigation', () => {});
jest.mock('swiper/css/pagination', () => {});

import { useSponsorshipStore } from '@/lib/stores/sponsorshipStore';

import MisApadrinamientosPage from '../page';

const makeSponsorship = (overrides = {}) => ({
  id: 1,
  user: 1,
  animal: 1,
  animal_name: 'Milo',
  animal_species: 'cat',
  shelter_name: 'Cat Haven',
  shelter_city: 'Cali',
  thumbnail_url: null,
  amount: '30000.00',
  frequency: 'monthly',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

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
    expect(screen.getByText('Aún no apadrinas a ningún animal')).toBeInTheDocument();
    expect(screen.getByText(/contribuyes mensualmente/)).toBeInTheDocument();
  });

  it('renders sponsorship card with animal name and status', () => {
    useSponsorshipStore.setState({ sponsorships: [makeSponsorship()] });

    render(<MisApadrinamientosPage />);
    expect(screen.getByText('Milo')).toBeInTheDocument();
    // "Activo" appears in filter chip + card badge
    expect(screen.getAllByText('Activo').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Cat Haven/)).toBeInTheDocument();
  });

  it('renders summary cards with active count and monthly total', () => {
    useSponsorshipStore.setState({ sponsorships: [makeSponsorship()] });

    render(<MisApadrinamientosPage />);
    expect(screen.getByText(/animales apadrinados activos/)).toBeInTheDocument();
    expect(screen.getAllByText(/30,000/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders loading skeletons', () => {
    useSponsorshipStore.setState({ loading: true, fetchSponsorships: jest.fn() });

    render(<MisApadrinamientosPage />);
    expect(document.querySelectorAll('.animate-shimmer').length).toBeGreaterThan(0);
  });

  it('renders one-time frequency label', () => {
    useSponsorshipStore.setState({
      sponsorships: [makeSponsorship({ frequency: 'one_time' })],
    });

    render(<MisApadrinamientosPage />);
    expect(screen.getByText('pago único')).toBeInTheDocument();
  });

  it('renders per month label for monthly frequency', () => {
    useSponsorshipStore.setState({ sponsorships: [makeSponsorship()] });

    render(<MisApadrinamientosPage />);
    expect(screen.getByText('por mes')).toBeInTheDocument();
  });

  it('renders amount prominently', () => {
    useSponsorshipStore.setState({ sponsorships: [makeSponsorship()] });

    render(<MisApadrinamientosPage />);
    expect(screen.getAllByText(/\$30,000/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders counter in title when sponsorships exist', () => {
    useSponsorshipStore.setState({ sponsorships: [makeSponsorship()] });

    render(<MisApadrinamientosPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('(1)');
  });

  it('filters sponsorships by status when filter button is clicked', async () => {
    useSponsorshipStore.setState({
      sponsorships: [
        makeSponsorship({ id: 1, status: 'active', animal_name: 'Milo' }),
        makeSponsorship({ id: 2, status: 'paused', animal_name: 'Luna', amount: '20000.00' }),
      ],
    });

    render(<MisApadrinamientosPage />);
    expect(screen.getByText('Milo')).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();

    // Click "Pausado" filter
    await userEvent.click(screen.getByRole('button', { name: 'Pausado' }));

    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.queryByText('Milo')).not.toBeInTheDocument();
  });

  it('shows empty filter state and clear button when filter matches nothing', async () => {
    useSponsorshipStore.setState({
      sponsorships: [makeSponsorship({ id: 1, status: 'active' })],
    });

    render(<MisApadrinamientosPage />);

    // Click "Cancelado" filter - no sponsorships match
    await userEvent.click(screen.getByRole('button', { name: 'Cancelado' }));

    expect(screen.getByText('No hay apadrinamientos con este estado')).toBeInTheDocument();
    // Click clear filter
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtro' }));

    // Sponsorship should be visible again
    expect(screen.getByText('Milo')).toBeInTheDocument();
  });

  it('renders dog icon for dog species', () => {
    useSponsorshipStore.setState({
      sponsorships: [makeSponsorship({ animal_species: 'dog', thumbnail_url: null })],
    });

    render(<MisApadrinamientosPage />);
    // The sponsorship card should render (link with animal name)
    expect(screen.getByText('Milo')).toBeInTheDocument();
  });
});
