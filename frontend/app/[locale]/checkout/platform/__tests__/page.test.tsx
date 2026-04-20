import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutPlatformPage from '../page';
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

describe('CheckoutPlatformPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: AMOUNT_OPTIONS });
  });

  it('renders page heading', async () => {
    render(<CheckoutPlatformPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Apoyar la plataforma');
  });

  it('renders placeholder payment notice', () => {
    render(<CheckoutPlatformPage />);
    expect(screen.getByText(/modo placeholder/i)).toBeInTheDocument();
  });

  it('renders platform context banner', () => {
    render(<CheckoutPlatformPage />);
    expect(screen.getByText(/Donación al sostenimiento de Tuhuella/i)).toBeInTheDocument();
  });

  it('renders preset amount buttons', async () => {
    render(<CheckoutPlatformPage />);
    await waitFor(() => {
      expect(screen.getByText('$10,000')).toBeInTheDocument();
    });
    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
  });

  it('selects preset amount when clicked', async () => {
    render(<CheckoutPlatformPage />);
    await waitFor(() => {
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('$25,000'));
    const btn = screen.getByRole('button', { name: /Apoyar/ });
    expect(btn.textContent).toContain('25,000');
  });

  it('renders payment method options', () => {
    render(<CheckoutPlatformPage />);
    expect(screen.getByText('Tarjeta de crédito/débito')).toBeInTheDocument();
    expect(screen.getByText('PSE (transferencia bancaria)')).toBeInTheDocument();
    expect(screen.getByText('Nequi')).toBeInTheDocument();
  });

  it('renders message textarea', () => {
    render(<CheckoutPlatformPage />);
    expect(screen.getByLabelText(/Mensaje/i)).toBeInTheDocument();
  });

  it('disables submit button when no amount selected', () => {
    render(<CheckoutPlatformPage />);
    const btn = screen.getByRole('button', { name: /Apoyar/ });
    expect(btn).toBeDisabled();
  });

  it('enables submit button when preset amount is selected', async () => {
    render(<CheckoutPlatformPage />);
    await waitFor(() => {
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('$25,000'));
    const btn = screen.getByRole('button', { name: /Apoyar/ });
    expect(btn).not.toBeDisabled();
  });

  it('falls back to hardcoded amounts when API fails', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('API error'));
    render(<CheckoutPlatformPage />);
    await waitFor(() => {
      expect(screen.getByText('$10,000')).toBeInTheDocument();
    });
    expect(screen.getByText('$200,000')).toBeInTheDocument();
  });

  it('shows Procesando text while submitting then redirects with dest=platform', async () => {
    render(<CheckoutPlatformPage />);
    await waitFor(() => {
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('$25,000'));
    const submitBtn = screen.getByRole('button', { name: /Apoyar/ });
    userEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Procesando/ })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('dest=platform'));
    }, { timeout: 3000 });
  });

  it('allows changing payment method', async () => {
    render(<CheckoutPlatformPage />);
    const pseRadio = screen.getByDisplayValue('pse');
    await userEvent.click(pseRadio);
    expect(pseRadio).toBeChecked();
  });
});
