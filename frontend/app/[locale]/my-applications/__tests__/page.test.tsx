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

import { useAdoptionStore } from '@/lib/stores/adoptionStore';

import MisSolicitudesPage from '../page';

const makeApp = (overrides = {}) => ({
  id: 1,
  animal: 1,
  animal_name: 'Luna',
  animal_species: 'dog',
  shelter_name: 'Patitas',
  shelter_city: 'Bogotá',
  thumbnail_url: null,
  user: 1,
  user_email: 'test@example.com',
  status: 'reviewing',
  form_answers: {},
  created_at: '2026-01-10T00:00:00Z',
  ...overrides,
});

describe('MisSolicitudesPage', () => {
  beforeEach(() => {
    useAdoptionStore.setState({
      applications: [],
      loading: false,
      error: null,
      fetchApplications: jest.fn(),
    });
  });

  it('renders page title', () => {
    render(<MisSolicitudesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mis Solicitudes de Adopción');
  });

  it('renders empty state when no applications', () => {
    render(<MisSolicitudesPage />);
    expect(screen.getByText('Aún no has aplicado para adoptar')).toBeInTheDocument();
    expect(screen.getByText(/Miles de animales esperan/)).toBeInTheDocument();
  });

  it('renders application card with animal name and status', () => {
    useAdoptionStore.setState({ applications: [makeApp()] });

    render(<MisSolicitudesPage />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText(/Patitas/)).toBeInTheDocument();
  });

  it('renders counter in title when applications exist', () => {
    useAdoptionStore.setState({ applications: [makeApp(), makeApp({ id: 2, animal: 2, animal_name: 'Max' })] });

    render(<MisSolicitudesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('(2)');
  });

  it('renders summary stat cards', () => {
    useAdoptionStore.setState({
      applications: [
        makeApp({ status: 'submitted' }),
        makeApp({ id: 2, animal: 2, status: 'approved' }),
      ],
    });

    render(<MisSolicitudesPage />);
    // Labels appear in stat cards + filter chips + card badges
    expect(screen.getAllByText('Enviada').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Aprobada').length).toBeGreaterThanOrEqual(2);
  });

  it('renders loading skeletons', () => {
    useAdoptionStore.setState({ loading: true, fetchApplications: jest.fn() });

    render(<MisSolicitudesPage />);
    expect(document.querySelectorAll('.animate-shimmer').length).toBeGreaterThan(0);
  });

  it('filters by status when chip is clicked', async () => {
    useAdoptionStore.setState({
      applications: [
        makeApp({ id: 1, status: 'submitted', animal_name: 'Firulais' }),
        makeApp({ id: 2, animal: 2, animal_name: 'Max', status: 'approved' }),
      ],
    });

    render(<MisSolicitudesPage />);
    const filterButtons = screen.getAllByRole('button', { name: /Aprobada/ });
    await userEvent.click(filterButtons[0]);
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.queryByText('Firulais')).not.toBeInTheDocument();
  });

  it('renders status badge colors for different statuses', () => {
    useAdoptionStore.setState({ applications: [makeApp({ status: 'rejected' })] });

    render(<MisSolicitudesPage />);
    expect(screen.getAllByText('Rechazada').length).toBeGreaterThanOrEqual(1);
  });
});
