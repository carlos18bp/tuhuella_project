import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShelterOnboardingPage from '../page';
import { useShelterStore } from '@/lib/stores/shelterStore';

const mockPush = jest.fn();
jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/shelterStore', () => ({ useShelterStore: jest.fn() }));

const mockUseShelterStore = useShelterStore as unknown as jest.Mock;

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    createShelter: jest.fn().mockResolvedValue({ id: 1 }),
  };
  const state = { ...defaults, ...overrides };
  mockUseShelterStore.mockImplementation((sel: any) => sel(state));
  return state;
};

const fillForm = () => {
  fireEvent.change(screen.getByLabelText(/Nombre del refugio/), { target: { value: 'Mi Refugio' } });
  fireEvent.change(screen.getByLabelText(/Ciudad/), { target: { value: 'Bogotá' } });
};

describe('ShelterOnboardingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMock();
    render(<ShelterOnboardingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Registrar Refugio');
  });

  it('renders all form fields', () => {
    setupMock();
    render(<ShelterOnboardingPage />);
    expect(screen.getByLabelText(/Nombre del refugio/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ciudad/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email del refugio/)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    setupMock();
    render(<ShelterOnboardingPage />);
    expect(screen.getByRole('button', { name: 'Registrar refugio' })).toBeInTheDocument();
  });

  it('allows entering shelter name', async () => {
    setupMock();
    render(<ShelterOnboardingPage />);
    const nameInput = screen.getByLabelText(/Nombre del refugio/);
    fireEvent.change(nameInput, { target: { value: 'Mi Refugio' } });
    expect(nameInput).toHaveValue('Mi Refugio');
  });

  it('calls createShelter on form submission with filled data', async () => {
    const state = setupMock();
    render(<ShelterOnboardingPage />);
    fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Registrar refugio' }));

    await waitFor(() => {
      expect(state.createShelter).toHaveBeenCalled();
    });
  });

  it('redirects to dashboard after successful registration', async () => {
    setupMock();
    render(<ShelterOnboardingPage />);
    fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Registrar refugio' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/shelter/dashboard');
    });
  });

  it('shows error message when registration fails', async () => {
    setupMock({
      createShelter: jest.fn().mockRejectedValue(new Error('Server error')),
    });
    render(<ShelterOnboardingPage />);
    fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Registrar refugio' }));

    await waitFor(() => {
      expect(screen.getByText(/Error al registrar/)).toBeInTheDocument();
    });
  });

  it('shows Registrando text during submission', async () => {
    let resolveCreate: (v: unknown) => void;
    const createPromise = new Promise((resolve) => { resolveCreate = resolve; });
    setupMock({
      createShelter: jest.fn().mockReturnValue(createPromise),
    });
    render(<ShelterOnboardingPage />);
    fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Registrar refugio' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Registrando/i })).toBeDisabled();
    });

    resolveCreate!({ id: 1 });
  });

  it('shows validation error when name is whitespace-only on submit', async () => {
    const state = setupMock();
    render(<ShelterOnboardingPage />);
    fireEvent.change(screen.getByLabelText(/Nombre del refugio/), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText(/Ciudad/), { target: { value: 'Bogotá' } });
    await userEvent.click(screen.getByRole('button', { name: 'Registrar refugio' }));

    await waitFor(() => {
      expect(screen.getByText('El nombre y la ciudad son obligatorios')).toBeInTheDocument();
    });
    expect(state.createShelter).not.toHaveBeenCalled();
  });
});
