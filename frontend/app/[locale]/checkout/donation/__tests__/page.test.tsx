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
});
