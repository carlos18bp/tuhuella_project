import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { useAdoptionStore } from '@/lib/stores/adoptionStore';

import MisSolicitudesPage from '../page';

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
    expect(screen.getByText('No tienes solicitudes de adopción.')).toBeInTheDocument();
  });

  it('renders application list with status badges', () => {
    useAdoptionStore.setState({
      applications: [
        {
          id: 1,
          animal: 1,
          animal_name: 'Luna',
          user: 1,
          user_email: 'test@example.com',
          status: 'reviewing',
          form_answers: {},
          created_at: '2026-01-10T00:00:00Z',
          shelter_name: 'Patitas',
        },
      ],
    });

    render(<MisSolicitudesPage />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('En revisión')).toBeInTheDocument();
    expect(screen.getByText('Patitas')).toBeInTheDocument();
  });
});
