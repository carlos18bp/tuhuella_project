import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutDonacionPage from '../page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/lib/hooks/useRequireAuth', () => ({ useRequireAuth: jest.fn() }));

describe('CheckoutDonacionPage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders page heading', () => {
    render(<CheckoutDonacionPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Donar');
  });

  it('renders placeholder payment notice', () => {
    render(<CheckoutDonacionPage />);
    expect(screen.getByText(/modo placeholder/)).toBeInTheDocument();
  });

  it('renders preset amount buttons', () => {
    render(<CheckoutDonacionPage />);
    expect(screen.getByText('$10,000')).toBeInTheDocument();
    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
  });

  it('selects preset amount when clicked', async () => {
    render(<CheckoutDonacionPage />);
    await userEvent.click(screen.getByText('$25,000'));
    const input = screen.getByPlaceholderText('Otro monto');
    expect(input).toHaveValue(25000);
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

  it('disables submit button when no amount entered', () => {
    render(<CheckoutDonacionPage />);
    const btn = screen.getByRole('button', { name: /Donar/ });
    expect(btn).toBeDisabled();
  });

  it('enables submit button when amount is entered', () => {
    render(<CheckoutDonacionPage />);
    fireEvent.change(screen.getByPlaceholderText('Otro monto'), { target: { value: '5000' } });
    const btn = screen.getByRole('button', { name: /Donar/ });
    expect(btn).not.toBeDisabled();
  });

  it('allows changing payment method', async () => {
    render(<CheckoutDonacionPage />);
    const pseRadio = screen.getByDisplayValue('pse');
    await userEvent.click(pseRadio);
    expect(pseRadio).toBeChecked();
  });

  it('allows entering custom amount via input', () => {
    render(<CheckoutDonacionPage />);
    fireEvent.change(screen.getByPlaceholderText('Otro monto'), { target: { value: '7500' } });
    expect(screen.getByPlaceholderText('Otro monto')).toHaveValue(7500);
  });
});
