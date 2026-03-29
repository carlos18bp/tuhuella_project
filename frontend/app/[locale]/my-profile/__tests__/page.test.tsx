import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { useAuthStore } from '@/lib/stores/authStore';

import MiPerfilPage from '../page';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Juan',
  last_name: 'Pérez',
  phone: '+57 300 1234567',
  city: 'Bogotá',
  role: 'adopter' as const,
  is_staff: false,
  date_joined: '2025-03-15T10:00:00Z',
};

const mockStats = {
  applications: { total: 3, by_status: { submitted: 1, reviewing: 1, approved: 1, rejected: 0, interview: 0 } },
  sponsorships: { active_count: 2, total_count: 3 },
  donations: { total_amount: '150.00', count: 5 },
  favorites: { count: 7, preview: [{ id: 1, name: 'Luna', species: 'dog', thumbnail_url: null }] },
  adopter_intent: { status: 'active', visibility: 'public' },
  shelter_invites: { pending_count: 0 },
};

describe('MiPerfilPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      profileStats: null,
      activity: [],
      profileLoading: false,
      fetchProfileStats: jest.fn(),
      fetchActivity: jest.fn(),
    });
  });

  it('renders loading skeleton when user is null', () => {
    render(<MiPerfilPage />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders user profile when user is set', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Juan Pérez');
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders member since date', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    expect(screen.getByText(/Miembro desde/)).toBeInTheDocument();
  });

  it('renders profile completeness bar', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    // User has name, email, phone, city = 70%, no intent
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('renders edit profile link in profile card', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    const editLinks = screen.getAllByRole('link', { name: /Editar perfil/ });
    expect(editLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders activity cards with stats when profileStats loaded', () => {
    useAuthStore.setState({ user: mockUser, profileStats: mockStats });

    render(<MiPerfilPage />);
    expect(screen.getByText(/3 solicitudes/)).toBeInTheDocument();
    expect(screen.getByText(/\$150\.00 donados/)).toBeInTheDocument();
    expect(screen.getByText(/Apadrinando 2 animales/)).toBeInTheDocument();
    expect(screen.getByText(/7 animales guardados/)).toBeInTheDocument();
  });

  it('renders shelter invite banner when pending invites exist', () => {
    useAuthStore.setState({
      user: mockUser,
      profileStats: { ...mockStats, shelter_invites: { pending_count: 2 } },
    });

    render(<MiPerfilPage />);
    expect(screen.getByText(/2 invitación/)).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    expect(screen.getByText('Actividad reciente')).toBeInTheDocument();
  });

  it('renders activity timeline events', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-28T12:00:00Z'));

    useAuthStore.setState({
      user: mockUser,
      activity: [
        { type: 'application', animal_name: 'Luna', status: 'submitted', date: '2026-03-28T12:00:00.000Z' },
        { type: 'favorite', animal_name: 'Max', date: '2026-03-28T12:00:00.000Z' },
      ],
    });

    render(<MiPerfilPage />);
    expect(screen.getByText(/Aplicaste para adoptar a Luna/)).toBeInTheDocument();
    expect(screen.getByText(/Agregaste a Max a favoritos/)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('renders edit profile link', () => {
    useAuthStore.setState({ user: mockUser });

    render(<MiPerfilPage />);
    expect(screen.getByRole('link', { name: /Editar perfil/ })).toHaveAttribute('href', '/my-profile/edit');
  });

  it('renders favorite preview thumbnails', () => {
    useAuthStore.setState({ user: mockUser, profileStats: mockStats });

    render(<MiPerfilPage />);
    // Luna's initial should be visible as preview
    expect(screen.getAllByText('L').length).toBeGreaterThanOrEqual(1);
  });

  it('renders red completeness bar when completeness < 50%', () => {
    const incompleteUser = { ...mockUser, phone: undefined, city: undefined };
    useAuthStore.setState({ user: incompleteUser });

    render(<MiPerfilPage />);
    // Only name (15) + email (15) = 30%
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('renders 100% completeness with intent', () => {
    useAuthStore.setState({ user: mockUser, profileStats: mockStats });

    render(<MiPerfilPage />);
    // name(15) + email(15) + phone(20) + city(20) + intent(30) = 100
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Perfil completo')).toBeInTheDocument();
  });

  it('renders donation and sponsorship activity events', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-28T12:00:00Z'));

    useAuthStore.setState({
      user: mockUser,
      activity: [
        { type: 'donation', amount: '50000', shelter_name: 'Patitas', date: '2026-03-27T12:00:00.000Z' },
        { type: 'sponsorship', animal_name: 'Rocky', date: '2026-01-15T12:00:00.000Z' },
      ],
    });

    render(<MiPerfilPage />);
    expect(screen.getByText(/Donaste \$50000/)).toBeInTheDocument();
    expect(screen.getByText(/Comenzaste a apadrinar a Rocky/)).toBeInTheDocument();
    expect(screen.getByText('Ayer')).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('renders +N indicator when favorites exceed preview limit', () => {
    const manyFavStats = {
      ...mockStats,
      favorites: {
        count: 8,
        preview: [
          { id: 1, name: 'Luna', species: 'dog', thumbnail_url: null },
          { id: 2, name: 'Max', species: 'dog', thumbnail_url: null },
          { id: 3, name: 'Rocky', species: 'dog', thumbnail_url: null },
          { id: 4, name: 'Milo', species: 'cat', thumbnail_url: null },
          { id: 5, name: 'Nala', species: 'cat', thumbnail_url: null },
        ],
      },
    };
    useAuthStore.setState({ user: mockUser, profileStats: manyFavStats });

    render(<MiPerfilPage />);
    expect(screen.getByText('+4')).toBeInTheDocument();
  });
});
