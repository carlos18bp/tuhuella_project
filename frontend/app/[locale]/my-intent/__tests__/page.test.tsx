import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MiIntencionPage from '../page';
import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    user: { id: 1, email: 'test@example.com', role: 'adopter' },
  };
  const state = { ...defaults, ...overrides };
  mockUseAuthStore.mockImplementation((sel: any) => sel(state));
  return state;
};

describe('MiIntencionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading text when user is null', () => {
    setupMock({ user: null });
    render(<MiIntencionPage />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders page heading when user exists', () => {
    mockApi.get.mockRejectedValueOnce(new Error('not found'));
    setupMock();
    render(<MiIntencionPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mi Intención de Adopción');
  });

  it('renders loading skeleton while fetching intent', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    setupMock();
    const { container } = render(<MiIntencionPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders form after loading when no intent exists', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('not found'));
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Cuéntanos qué buscas/)).toBeInTheDocument();
    });
  });

  it('renders form with existing intent data', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { description: 'Busco un perrito', visibility: 'private', status: 'active' },
    });
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Busco un perrito')).toBeInTheDocument();
    });
  });

  it('renders status badge for active intent', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { description: 'Busco', visibility: 'public', status: 'active' },
    });
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByText('Activa')).toBeInTheDocument();
    });
  });

  it('renders status badge for matched intent', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { description: 'Busco', visibility: 'public', status: 'matched' },
    });
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByText('Emparejada')).toBeInTheDocument();
    });
  });

  it('renders status badge for paused intent', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { description: 'Busco', visibility: 'public', status: 'paused' },
    });
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByText('Pausada')).toBeInTheDocument();
    });
  });

  it('shows create button when no intent exists', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('not found'));
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Crear intención' })).toBeInTheDocument();
    });
  });

  it('shows update button when intent exists', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { description: 'Busco', visibility: 'public', status: 'active' },
    });
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Actualizar intención' })).toBeInTheDocument();
    });
  });

  it('creates new intent on save when no existing intent', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('not found'));
    mockApi.post.mockResolvedValueOnce({
      data: { description: 'Nuevo', visibility: 'public', status: 'active' },
    });
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Crear intención' })).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/Cuéntanos qué buscas/);
    await userEvent.type(textarea, 'Nuevo');
    await userEvent.click(screen.getByRole('button', { name: 'Crear intención' }));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
    });
  });

  it('updates existing intent on save', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { description: 'Busco', visibility: 'public', status: 'active' },
    });
    mockApi.patch.mockResolvedValueOnce({
      data: { description: 'Busco updated', visibility: 'public', status: 'active' },
    });
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Actualizar intención' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Actualizar intención' }));

    await waitFor(() => {
      expect(mockApi.patch).toHaveBeenCalled();
    });
  });

  it('allows changing visibility to private', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('not found'));
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Visibilidad')).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText('Visibilidad'), 'private');
    expect(screen.getByLabelText('Visibilidad')).toHaveValue('private');
  });

  it('handles save error gracefully', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('not found'));
    mockApi.post.mockRejectedValueOnce(new Error('Server error'));
    setupMock();
    render(<MiIntencionPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Crear intención' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Crear intención' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Crear intención' })).not.toBeDisabled();
    });
  });
});
