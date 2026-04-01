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

import { useDonationStore } from '@/lib/stores/donationStore';

import MisDonacionesPage from '../page';

const makeDonation = (overrides = {}) => ({
  id: 1,
  user: 1,
  user_email: 'test@example.com',
  destination: 'campaign' as const,
  shelter: 1,
  shelter_name: 'Patitas',
  shelter_city: 'Bogotá',
  campaign: 1,
  campaign_title: 'Medical Fund',
  amount: '50000.00',
  status: 'paid' as const,
  created_at: '2026-01-15T00:00:00Z',
  ...overrides,
});

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
    expect(screen.getByText('Aún no has hecho ninguna donación')).toBeInTheDocument();
    expect(screen.getByText(/Tu aporte hace la diferencia/)).toBeInTheDocument();
  });

  it('renders donation with amount and campaign', () => {
    useDonationStore.setState({ donations: [makeDonation()] });

    render(<MisDonacionesPage />);
    expect(screen.getAllByText(/50,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Medical Fund')).toBeInTheDocument();
    // "Pagada" appears in filter + card badge
    expect(screen.getAllByText('Pagada').length).toBeGreaterThanOrEqual(1);
  });

  it('renders total donated summary card', () => {
    useDonationStore.setState({ donations: [makeDonation()] });

    render(<MisDonacionesPage />);
    expect(screen.getAllByText(/\$50,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/donados en 1 donaciones/)).toBeInTheDocument();
  });

  it('renders loading skeletons', () => {
    useDonationStore.setState({ loading: true, fetchDonations: jest.fn() });

    render(<MisDonacionesPage />);
    expect(document.querySelectorAll('.animate-shimmer').length).toBeGreaterThan(0);
  });

  it('renders pending status with translated label', () => {
    useDonationStore.setState({ donations: [makeDonation({ status: 'pending' })] });

    render(<MisDonacionesPage />);
    // Appears in filter chip + card badge
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThanOrEqual(1);
  });

  it('renders shelter info', () => {
    useDonationStore.setState({ donations: [makeDonation()] });

    render(<MisDonacionesPage />);
    expect(screen.getByText(/Patitas/)).toBeInTheDocument();
  });

  it('renders campaign link on empty state', () => {
    render(<MisDonacionesPage />);
    expect(screen.getByRole('link', { name: /Explorar campañas/ })).toHaveAttribute('href', '/campaigns');
  });

  it('renders counter in title when donations exist', () => {
    useDonationStore.setState({ donations: [makeDonation()] });

    render(<MisDonacionesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('(1)');
  });

  it('filters donations by status when filter button is clicked', async () => {
    useDonationStore.setState({
      donations: [
        makeDonation({ id: 1, status: 'paid' }),
        makeDonation({
          id: 2,
          status: 'pending',
          amount: '25000.00',
          destination: 'campaign',
          campaign: 2,
          campaign_title: 'Other Fund',
        }),
      ],
    });

    render(<MisDonacionesPage />);
    // Both donations should be visible initially
    expect(screen.getByText('Medical Fund')).toBeInTheDocument();
    expect(screen.getByText('Other Fund')).toBeInTheDocument();

    // Click the "Pendiente" filter button
    await userEvent.click(screen.getByRole('button', { name: 'Pendiente' }));

    // Only the pending donation should remain
    expect(screen.getByText('Other Fund')).toBeInTheDocument();
    expect(screen.queryByText('Medical Fund')).not.toBeInTheDocument();
  });

  it('shows empty filter state and clear button when filter matches nothing', async () => {
    useDonationStore.setState({
      donations: [makeDonation({ id: 1, status: 'paid' })],
    });

    render(<MisDonacionesPage />);

    // Click "Fallida" filter - no donations match
    await userEvent.click(screen.getByRole('button', { name: 'Fallida' }));

    expect(screen.getByText('No hay donaciones con este estado')).toBeInTheDocument();
    // Click clear filter
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtro' }));

    // Donation should be visible again
    expect(screen.getByText('Medical Fund')).toBeInTheDocument();
  });

  it('renders donation message when provided', () => {
    useDonationStore.setState({
      donations: [makeDonation({ message: 'Hope this helps' })],
    });

    render(<MisDonacionesPage />);
    expect(screen.getByText(/Hope this helps/)).toBeInTheDocument();
  });
});
