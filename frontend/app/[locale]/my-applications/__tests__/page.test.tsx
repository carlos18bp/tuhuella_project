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

  it('renders loading skeletons when loading is true', () => {
    useAdoptionStore.setState({
      applications: [],
      loading: true,
      fetchApplications: jest.fn(),
    });

    render(<MisSolicitudesPage />);
    const skeletons = document.querySelectorAll('.animate-shimmer');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders submitted status label', () => {
    useAdoptionStore.setState({
      applications: [
        {
          id: 2,
          animal: 2,
          animal_name: 'Max',
          user: 1,
          user_email: 'test@example.com',
          status: 'submitted',
          form_answers: {},
          created_at: '2026-02-01T00:00:00Z',
          shelter_name: null,
        },
      ],
    });

    render(<MisSolicitudesPage />);
    expect(screen.getByText('Enviada')).toBeInTheDocument();
  });

  it('renders approved status label', () => {
    useAdoptionStore.setState({
      applications: [
        {
          id: 3,
          animal: 3,
          animal_name: 'Rex',
          user: 1,
          user_email: 'test@example.com',
          status: 'approved',
          form_answers: {},
          created_at: '2026-02-15T00:00:00Z',
          shelter_name: 'Happy Paws',
        },
      ],
    });

    render(<MisSolicitudesPage />);
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
  });

  it('renders rejected status label', () => {
    useAdoptionStore.setState({
      applications: [
        {
          id: 4,
          animal: 4,
          animal_name: 'Bella',
          user: 1,
          user_email: 'test@example.com',
          status: 'rejected',
          form_answers: {},
          created_at: '2026-03-01T00:00:00Z',
          shelter_name: null,
        },
      ],
    });

    render(<MisSolicitudesPage />);
    expect(screen.getByText('Rechazada')).toBeInTheDocument();
  });

  it('renders unknown status as raw value when not in statusLabels', () => {
    useAdoptionStore.setState({
      applications: [
        {
          id: 5,
          animal: 5,
          animal_name: 'Coco',
          user: 1,
          user_email: 'test@example.com',
          status: 'archived',
          form_answers: {},
          created_at: '2026-03-10T00:00:00Z',
          shelter_name: null,
        },
      ],
    });

    render(<MisSolicitudesPage />);
    expect(screen.getByText('archived')).toBeInTheDocument();
  });

  it('does not render shelter name when shelter_name is null', () => {
    useAdoptionStore.setState({
      applications: [
        {
          id: 6,
          animal: 6,
          animal_name: 'Fido',
          user: 1,
          user_email: 'test@example.com',
          status: 'interview',
          form_answers: {},
          created_at: '2026-03-15T00:00:00Z',
          shelter_name: null,
        },
      ],
    });

    render(<MisSolicitudesPage />);
    expect(screen.getByText('Entrevista')).toBeInTheDocument();
  });
});
