import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
    useAuthStore.setState({
      user: mockUser,
      activity: [
        { type: 'application', animal_name: 'Luna', status: 'submitted', date: new Date().toISOString() },
        { type: 'favorite', animal_name: 'Max', date: new Date().toISOString() },
      ],
    });

    render(<MiPerfilPage />);
    expect(screen.getByText(/Aplicaste para adoptar a Luna/)).toBeInTheDocument();
    expect(screen.getByText(/Agregaste a Max a favoritos/)).toBeInTheDocument();
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
});
