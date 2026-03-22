import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutApadrinamientoPage from '../page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));

describe('CheckoutApadrinamientoPage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

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

  it('renders preset amount buttons with /mes suffix for monthly', () => {
    render(<CheckoutApadrinamientoPage />);
    expect(screen.getByText('$15,000/mes')).toBeInTheDocument();
    expect(screen.getByText('$30,000/mes')).toBeInTheDocument();
  });

  it('removes /mes suffix when one_time frequency selected', async () => {
    render(<CheckoutApadrinamientoPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Pago único' }));
    expect(screen.getByText('$15,000')).toBeInTheDocument();
    expect(screen.queryByText('$15,000/mes')).not.toBeInTheDocument();
  });

  it('selects preset amount when clicked', async () => {
    render(<CheckoutApadrinamientoPage />);
    await userEvent.click(screen.getByText('$30,000/mes'));
    expect(screen.getByPlaceholderText('Otro monto')).toHaveValue(30000);
  });

  it('renders payment method options', () => {
    render(<CheckoutApadrinamientoPage />);
    expect(screen.getByText('Tarjeta de crédito/débito')).toBeInTheDocument();
    expect(screen.getByText('PSE (transferencia bancaria)')).toBeInTheDocument();
    expect(screen.getByText('Nequi')).toBeInTheDocument();
  });

  it('disables submit button when no amount entered', () => {
    render(<CheckoutApadrinamientoPage />);
    const btn = screen.getByRole('button', { name: /Apadrinar/ });
    expect(btn).toBeDisabled();
  });

  it('enables submit button when amount is entered', () => {
    render(<CheckoutApadrinamientoPage />);
    fireEvent.change(screen.getByPlaceholderText('Otro monto'), { target: { value: '5000' } });
    const btn = screen.getByRole('button', { name: /Apadrinar/ });
    expect(btn).not.toBeDisabled();
  });

  it('allows entering custom amount via input', () => {
    render(<CheckoutApadrinamientoPage />);
    fireEvent.change(screen.getByPlaceholderText('Otro monto'), { target: { value: '7500' } });
    expect(screen.getByPlaceholderText('Otro monto')).toHaveValue(7500);
  });

  it('shows /mes in submit button for monthly frequency', () => {
    render(<CheckoutApadrinamientoPage />);
    fireEvent.change(screen.getByPlaceholderText('Otro monto'), { target: { value: '10000' } });
    const submitBtn = screen.getByRole('button', { name: /Apadrinar/ });
    expect(submitBtn.textContent).toContain('/mes');
  });
});
