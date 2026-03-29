import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAuthStore } from '@/lib/stores/authStore';
import { api } from '@/lib/services/http';

const mockPush = jest.fn();

jest.mock('@/lib/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({ positionId: '1' }),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: React.forwardRef(function MockReCAPTCHA(props: any, ref: any) {
    React.useImperativeHandle(ref, () => ({ reset: jest.fn() }));
    return (
      <div data-testid="recaptcha" onClick={() => props.onChange?.('test-token')} />
    );
  }),
}));

jest.mock('@/components/ui', () => ({
  TermsModal: ({ open, onAccept, onDecline, onClose }: any) =>
    open ? (
      <div data-testid="terms-modal">
        <button onClick={onAccept}>Accept</button>
        <button onClick={onDecline}>Decline</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

import VolunteerApplyPage from '../page';

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockApiGet = api.get as jest.Mock;
const mockApiPost = api.post as jest.Mock;

const baseUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Carlos',
  last_name: 'Pérez',
  phone: '3001234567',
  city: 'Bogotá',
  role: 'adopter',
};

const mockPosition = {
  id: 1,
  title: 'Cuidador de animales',
  description: 'Ayuda a cuidar a los animales del refugio',
};

function setupMocks(overrides: Record<string, unknown> = {}) {
  const state = {
    user: baseUser,
    isAuthenticated: true,
    isAuthReady: true,
    ...overrides,
  };
  mockUseAuthStore.mockImplementation((selector: (s: typeof state) => unknown) => selector(state));

  // Default: return site key and position list
  mockApiGet.mockImplementation((url: string) => {
    if (url.includes('captcha')) return Promise.resolve({ data: { site_key: '' } });
    return Promise.resolve({ data: [mockPosition] });
  });
}

describe('VolunteerApplyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading shimmer when not auth-ready', () => {
    setupMocks({ isAuthReady: false });
    render(<VolunteerApplyPage />);
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('redirects to sign-in when not authenticated', () => {
    setupMocks({ isAuthReady: true, isAuthenticated: false });
    render(<VolunteerApplyPage />);
    expect(mockPush).toHaveBeenCalledWith('/es/sign-in');
  });

  it('renders position not found when position does not exist', async () => {
    setupMocks();
    mockApiGet.mockImplementation((url: string) => {
      if (url.includes('captcha')) return Promise.resolve({ data: {} });
      return Promise.resolve({ data: [] }); // no positions
    });
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Posición no encontrada')).toBeInTheDocument();
    });
  });

  it('renders position title and form when loaded', async () => {
    setupMocks();
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Cuidador de animales')).toBeInTheDocument();
    });
    expect(screen.getByText('Formulario de Postulación')).toBeInTheDocument();
  });

  it('auto-fills form from user data', async () => {
    setupMocks();
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre/)).toHaveValue('Carlos');
    });
    expect(screen.getByLabelText(/Apellido/)).toHaveValue('Pérez');
    expect(screen.getByLabelText(/Correo electrónico/)).toHaveValue('test@example.com');
  });

  it('shows motivation minimum length error for short text', async () => {
    setupMocks();
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Formulario de Postulación')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/País/), 'Colombia');
    await user.type(screen.getByLabelText(/¿Por qué quieres ser voluntario/), 'Muy corto');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /Enviar Postulación/ }));

    expect(screen.getByText('Por favor escribe al menos 20 caracteres')).toBeInTheDocument();
  });

  it('shows terms validation error when not accepted', async () => {
    setupMocks();
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Formulario de Postulación')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    // Fill the required country + motivation fields
    await user.type(screen.getByLabelText(/País/), 'Colombia');
    await user.type(screen.getByLabelText(/¿Por qué quieres ser voluntario/), 'Me apasiona ayudar a los animales del refugio');

    await user.click(screen.getByRole('button', { name: /Enviar Postulación/ }));

    expect(screen.getByText('Debes aceptar los términos y condiciones para continuar')).toBeInTheDocument();
  });

  it('shows captcha error when site key present but no token', async () => {
    setupMocks();
    mockApiGet.mockImplementation((url: string) => {
      if (url.includes('captcha')) return Promise.resolve({ data: { site_key: 'test-key' } });
      return Promise.resolve({ data: [mockPosition] });
    });
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/País/), 'Colombia');
    await user.type(screen.getByLabelText(/¿Por qué quieres ser voluntario/), 'Me apasiona ayudar a los animales del refugio');
    await user.click(screen.getByRole('checkbox'));

    // Submit button should be disabled when captcha required but not completed
    const submitBtn = screen.getByRole('button', { name: /Enviar Postulación/ });
    expect(submitBtn).toBeDisabled();
  });

  it('shows motivation minimum length error', async () => {
    setupMocks();
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Formulario de Postulación')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/País/), 'Colombia');
    await user.type(screen.getByLabelText(/¿Por qué quieres ser voluntario/), 'Corto');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /Enviar Postulación/ }));

    expect(screen.getByText('Por favor escribe al menos 20 caracteres')).toBeInTheDocument();
  });

  it('calls api.post on valid form submission', async () => {
    setupMocks();
    mockApiPost.mockResolvedValue({ data: {} });
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Formulario de Postulación')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/País/), 'Colombia');
    await user.type(screen.getByLabelText(/¿Por qué quieres ser voluntario/), 'Me apasiona ayudar a los animales del refugio');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /Enviar Postulación/ }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalled();
    });
  });

  it('renders success state after submission', async () => {
    setupMocks();
    mockApiPost.mockResolvedValue({ data: {} });
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Formulario de Postulación')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/País/), 'Colombia');
    await user.type(screen.getByLabelText(/¿Por qué quieres ser voluntario/), 'Me apasiona ayudar a los animales del refugio');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /Enviar Postulación/ }));

    await waitFor(() => {
      expect(screen.getByText('¡Postulación enviada!')).toBeInTheDocument();
    });
  });

  it('handles server error with generic message', async () => {
    setupMocks();
    mockApiPost.mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Formulario de Postulación')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/País/), 'Colombia');
    await user.type(screen.getByLabelText(/¿Por qué quieres ser voluntario/), 'Me apasiona ayudar a los animales del refugio');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /Enviar Postulación/ }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('handles server error with field-level errors', async () => {
    setupMocks();
    mockApiPost.mockRejectedValue({
      response: { data: { email: ['Email ya registrado'] } },
    });
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Formulario de Postulación')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/País/), 'Colombia');
    await user.type(screen.getByLabelText(/¿Por qué quieres ser voluntario/), 'Me apasiona ayudar a los animales del refugio');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /Enviar Postulación/ }));

    await waitFor(() => {
      expect(screen.getByText('Email ya registrado')).toBeInTheDocument();
    });
  });

  it('opens terms modal and accepts terms', async () => {
    setupMocks();
    render(<VolunteerApplyPage />);

    await waitFor(() => {
      expect(screen.getByText('Formulario de Postulación')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Términos y Condiciones'));

    expect(screen.getByTestId('terms-modal')).toBeInTheDocument();

    await user.click(screen.getByText('Accept'));

    expect(screen.queryByTestId('terms-modal')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
