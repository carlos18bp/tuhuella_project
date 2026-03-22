import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { useAuthStore } from '@/lib/stores/authStore';

import MiPerfilPage from '../page';

describe('MiPerfilPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it('renders loading state when user is null', () => {
    render(<MiPerfilPage />);
    expect(screen.getByText('Cargando perfil...')).toBeInTheDocument();
  });

  it('renders user profile when user is set', () => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        city: 'Bogotá',
        role: 'adopter',
        is_staff: false,
      },
    });

    render(<MiPerfilPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mi Perfil');
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
