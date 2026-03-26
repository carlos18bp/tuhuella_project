import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutDonacionPage from '../page';
import { api } from '@/lib/services/http';

const mockPush = jest.fn();
jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: any) => React.createElement('a', { href, ...rest }, children),
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));
jest.mock('@/lib/hooks/useFAQs', () => ({
  useFAQsByTopic: () => ({ items: [], loading: false }),
}));
jest.mock('@/lib/services/http', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;

const AMOUNT_OPTIONS = [
  { id: 1, amount: 10000, label: '' },
  { id: 2, amount: 25000, label: '' },
  { id: 3, amount: 50000, label: '' },
  { id: 4, amount: 100000, label: '' },
];

describe('CheckoutDonacionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: AMOUNT_OPTIONS });
  });

  it('renders page heading', async () => {
    render(<CheckoutDonacionPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Donar');
  });

  it('renders placeholder payment notice', () => {
    render(<CheckoutDonacionPage />);
    expect(screen.getByText(/modo placeholder/)).toBeInTheDocument();
  });

  it('renders preset amount buttons', async () => {
    render(<CheckoutDonacionPage />);
    await waitFor(() => {
      expect(screen.getByText('$10,000')).toBeInTheDocument();
    });
    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
  });

  it('selects preset amount when clicked', async () => {
    render(<CheckoutDonacionPage />);
    await waitFor(() => {
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('$25,000'));
    const btn = screen.getByRole('button', { name: /Donar/ });
    expect(btn.textContent).toContain('25,000');
  });

  it('renders payment method options', () => {
    render(<CheckoutDonacionPage />);
    expect(screen.getByText('Tarjeta de crédito/débito')).toBeInTheDocument();
    expect(screen.getByText('PSE (transferencia bancaria)')).toBeInTheDocument();
    expect(screen.getByText('Nequi')).toBeInTheDocument();
  });

  it('renders message textarea', () => {
    render(<CheckoutDonacionPage />);
    expect(screen.getByLabelText(/Mensaje/)).toBeInTheDocument();
  });

  it('disables submit button when no amount selected', () => {
    render(<CheckoutDonacionPage />);
    const btn = screen.getByRole('button', { name: /Donar/ });
    expect(btn).toBeDisabled();
  });

  it('enables submit button when preset amount is selected', async () => {
    render(<CheckoutDonacionPage />);
    await waitFor(() => {
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('$25,000'));
    const btn = screen.getByRole('button', { name: /Donar/ });
    expect(btn).not.toBeDisabled();
  });

  it('allows changing payment method', async () => {
    render(<CheckoutDonacionPage />);
    const pseRadio = screen.getByDisplayValue('pse');
    await userEvent.click(pseRadio);
    expect(pseRadio).toBeChecked();
  });

  it('falls back to hardcoded amounts when API fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('API error'));
    render(<CheckoutDonacionPage />);
    await waitFor(() => {
      expect(screen.getByText('$10,000')).toBeInTheDocument();
    });
    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
    expect(screen.getByText('$200,000')).toBeInTheDocument();
  });

  it('shows Procesando text while submitting', async () => {
    render(<CheckoutDonacionPage />);
    await waitFor(() => {
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('$25,000'));
    const submitBtn = screen.getByRole('button', { name: /Donar/ });
    // Click submit — the button text changes to "Procesando..." immediately
    userEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Procesando/ })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('type=donation'));
    }, { timeout: 3000 });
  });

  it('does not submit when amount is zero', async () => {
    render(<CheckoutDonacionPage />);
    const form = screen.getByRole('button', { name: /Donar/ }).closest('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('allows typing a message in the textarea', async () => {
    render(<CheckoutDonacionPage />);
    const textarea = screen.getByLabelText(/Mensaje/);
    await userEvent.type(textarea, 'Gracias por su trabajo');
    expect(textarea).toHaveValue('Gracias por su trabajo');
  });

});
