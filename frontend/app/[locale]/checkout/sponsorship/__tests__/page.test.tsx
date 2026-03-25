import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutApadrinamientoPage from '../page';
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
  { id: 1, amount: 15000, label: '' },
  { id: 2, amount: 30000, label: '' },
  { id: 3, amount: 50000, label: '' },
  { id: 4, amount: 75000, label: '' },
];

describe('CheckoutApadrinamientoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: AMOUNT_OPTIONS });
  });

  it('renders page heading', () => {
    render(<CheckoutApadrinamientoPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Apadrinar');
  });

  it('renders placeholder payment notice', () => {
    render(<CheckoutApadrinamientoPage />);
    expect(screen.getByText(/modo placeholder/)).toBeInTheDocument();
  });

  it('renders frequency buttons', () => {
    render(<CheckoutApadrinamientoPage />);
    expect(screen.getByRole('button', { name: 'Mensual' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pago único' })).toBeInTheDocument();
  });

  it('renders preset amount buttons with /mes suffix for monthly', async () => {
    render(<CheckoutApadrinamientoPage />);
    await waitFor(() => {
      expect(screen.getByText('$15,000/mes')).toBeInTheDocument();
    });
    expect(screen.getByText('$30,000/mes')).toBeInTheDocument();
  });

  it('removes /mes suffix when one_time frequency selected', async () => {
    render(<CheckoutApadrinamientoPage />);
    await waitFor(() => {
      expect(screen.getByText('$15,000/mes')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Pago único' }));
    expect(screen.getByText('$15,000')).toBeInTheDocument();
    expect(screen.queryByText('$15,000/mes')).not.toBeInTheDocument();
  });

  it('selects preset amount when clicked', async () => {
    render(<CheckoutApadrinamientoPage />);
    await waitFor(() => {
      expect(screen.getByText('$30,000/mes')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('$30,000/mes'));
    const btn = screen.getByRole('button', { name: /Apadrinar/ });
    expect(btn.textContent).toContain('30,000');
  });

  it('renders payment method options', () => {
    render(<CheckoutApadrinamientoPage />);
    expect(screen.getByText('Tarjeta de crédito/débito')).toBeInTheDocument();
    expect(screen.getByText('PSE (transferencia bancaria)')).toBeInTheDocument();
    expect(screen.getByText('Nequi')).toBeInTheDocument();
  });

  it('disables submit button when no amount selected', () => {
    render(<CheckoutApadrinamientoPage />);
    const btn = screen.getByRole('button', { name: /Apadrinar/ });
    expect(btn).toBeDisabled();
  });

  it('enables submit button when preset amount is selected', async () => {
    render(<CheckoutApadrinamientoPage />);
    await waitFor(() => {
      expect(screen.getByText('$30,000/mes')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('$30,000/mes'));
    const btn = screen.getByRole('button', { name: /Apadrinar/ });
    expect(btn).not.toBeDisabled();
  });

  it('shows /mes in submit button for monthly frequency', async () => {
    render(<CheckoutApadrinamientoPage />);
    await waitFor(() => {
      expect(screen.getByText('$15,000/mes')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('$15,000/mes'));
    const submitBtn = screen.getByRole('button', { name: /Apadrinar/ });
    expect(submitBtn.textContent).toContain('/mes');
  });
});
