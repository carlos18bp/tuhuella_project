import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShelterConfigPage from '../page';
import { useShelterStore } from '@/lib/stores/shelterStore';
import { api } from '@/lib/services/http';
import { mockShelter } from '@/lib/__tests__/fixtures';

jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/shelterStore', () => ({ useShelterStore: jest.fn() }));
jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn() },
}));

const mockUseShelterStore = useShelterStore as unknown as jest.Mock;
const mockApi = api as jest.Mocked<typeof api>;

const mockUpdateShelter = jest.fn().mockResolvedValue(mockShelter);

const setupMock = () => {
  mockUseShelterStore.mockImplementation((sel: any) =>
    sel({ updateShelter: mockUpdateShelter }),
  );
};

describe('ShelterConfigPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMock();
  });

  it('renders loading skeleton initially', () => {
    mockApi.get.mockReturnValueOnce(new Promise(() => {}));
    const { container } = render(<ShelterConfigPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders no-shelter message when no shelter found', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByText('No tienes un refugio registrado.')).toBeInTheDocument();
    });
  });

  it('renders page heading when shelter loaded', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Configuración del Refugio');
    });
  });

  it('renders form with shelter data when loaded', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Patitas Felices')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bogotá')).toBeInTheDocument();
    });
  });

  it('renders description field with existing value', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/Refugio dedicado al rescate/)).toBeInTheDocument();
    });
  });

  it('renders phone and email fields with existing values', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('3001112233')).toBeInTheDocument();
      expect(screen.getByDisplayValue('info@patitasfelices.org')).toBeInTheDocument();
    });
  });

  it('allows editing shelter name', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Patitas Felices')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Patitas Felices');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');
    expect(nameInput).toHaveValue('New Name');
  });

  it('calls updateShelter on form submission', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(mockUpdateShelter).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  it('shows success message after save', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(screen.getByText(/guardados correctamente/i)).toBeInTheDocument();
    });
  });

  it('handles save error gracefully', async () => {
    mockUpdateShelter.mockRejectedValueOnce(new Error('Server error'));
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Guardar cambios/i })).not.toBeDisabled();
    });
  });

  it('renders verification status text', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [mockShelter] });
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByText(/verified/i)).toBeInTheDocument();
    });
  });

  it('handles API error on load gracefully', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));
    render(<ShelterConfigPage />);

    await waitFor(() => {
      expect(screen.getByText('No tienes un refugio registrado.')).toBeInTheDocument();
    });
  });
});
