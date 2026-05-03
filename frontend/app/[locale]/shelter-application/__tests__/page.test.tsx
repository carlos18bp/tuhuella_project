import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShelterApplicationPage from '../page';
import { useShelterApplicationStore } from '@/lib/stores/shelterApplicationStore';
import { useAuthStore } from '@/lib/stores/authStore';

const mockPush = jest.fn();
jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  Link: ({ href, children, ...rest }: any) =>
    React.createElement('a', { href, ...rest }, children),
}));
jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/stores/shelterApplicationStore', () => ({
  useShelterApplicationStore: Object.assign(jest.fn(), { getState: jest.fn() }),
}));
jest.mock('@/lib/stores/authStore', () => ({ useAuthStore: jest.fn() }));

const mockShelterApp = useShelterApplicationStore as unknown as jest.Mock & {
  getState: jest.Mock;
};
const mockAuth = useAuthStore as unknown as jest.Mock;

const setupStore = (overrides: Record<string, unknown> = {}) => {
  const defaults: Record<string, unknown> = {
    application: null,
    loading: false,
    submitting: false,
    error: null,
    fetchMine: jest.fn().mockResolvedValue(undefined),
    submit: jest.fn().mockResolvedValue({ id: 1, status: 'submitted' }),
    reset: jest.fn(),
  };
  const state = { ...defaults, ...overrides };
  mockShelterApp.mockImplementation((sel: any) => sel(state));
  mockShelterApp.getState.mockReturnValue(state);
  return state;
};

const setupAuth = (role = 'adopter') => {
  const state = { user: { id: 1, email: 'a@b.com', role } };
  mockAuth.mockImplementation((sel: any) => sel(state));
};

const fillStep1 = () => {
  fireEvent.change(screen.getByLabelText(/Nombre del refugio/), { target: { value: 'Patitas' } });
  fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Un refugio formal' } });
  fireEvent.change(screen.getByLabelText(/Ciudad/), { target: { value: 'Bogotá' } });
  fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '3001234567' } });
};

const fillStep2 = () => {
  fireEvent.change(screen.getByLabelText(/Razón social/), { target: { value: 'Patitas SAS' } });
  fireEvent.change(screen.getByLabelText(/NIT \/ RUT/), { target: { value: '900-1' } });
  fireEvent.change(screen.getByLabelText(/Nombre del representante legal/), { target: { value: 'Juan' } });
  fireEvent.change(screen.getByLabelText(/Documento del representante/), { target: { value: '999' } });
};

describe('ShelterApplicationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the wizard title and step 1 by default', () => {
    setupStore();
    setupAuth();
    render(<ShelterApplicationPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Postularte como refugio/i);
    expect(screen.getByLabelText(/Nombre del refugio/)).toBeInTheDocument();
  });

  it('blocks advancing to step 2 if step 1 fields are missing', async () => {
    setupStore();
    setupAuth();
    render(<ShelterApplicationPage />);
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByText(/El nombre del refugio es obligatorio/)).toBeInTheDocument();
  });

  it('moves through all 4 steps and submits', async () => {
    const state = setupStore();
    setupAuth();
    render(<ShelterApplicationPage />);

    fillStep1();
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    fillStep2();
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 3 has no required fields (documents deferred)
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 4
    fireEvent.change(screen.getByLabelText(/^Motivación/), { target: { value: 'Llevamos años rescatando' } });
    await userEvent.click(screen.getByRole('button', { name: /Enviar postulación/i }));

    await waitFor(() => {
      expect(state.submit).toHaveBeenCalled();
    });
    expect(mockPush).toHaveBeenCalledWith('/my-profile');
  });

  it('shows the status view when an active application exists', () => {
    setupStore({
      application: {
        id: 1,
        status: 'submitted',
        rejection_reason: '',
      },
    });
    setupAuth();
    render(<ShelterApplicationPage />);
    expect(screen.getByText(/Estado de tu postulación/i)).toBeInTheDocument();
    expect(screen.getByText(/Enviada/i)).toBeInTheDocument();
  });

  it('shows rejection details and a reapply button', () => {
    setupStore({
      application: {
        id: 1,
        status: 'rejected',
        rejection_reason: 'Documentos incompletos',
      },
    });
    setupAuth();
    render(<ShelterApplicationPage />);
    expect(screen.getByText(/Rechazada/)).toBeInTheDocument();
    expect(screen.getByText(/Documentos incompletos/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volver a postular/i })).toBeInTheDocument();
  });
});
