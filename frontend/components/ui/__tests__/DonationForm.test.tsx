import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DonationForm from '../DonationForm';

describe('DonationForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders preset amount buttons', () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button', { name: /10,000/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /25,000/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /50,000/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /100,000/ })).toBeInTheDocument();
  });

  it('renders custom preset amounts when provided', () => {
    render(<DonationForm onSubmit={mockOnSubmit} presetAmounts={[5000, 15000]} />);
    expect(screen.getByRole('button', { name: '$5,000' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '$15,000' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '$10,000' })).toBeNull();
  });

  it('sets amount when preset button is clicked', async () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);
    const presetBtn = screen.getByRole('button', { name: /10,000/ });
    await userEvent.click(presetBtn);

    const input = screen.getByPlaceholderText('Otro monto');
    expect(input).toHaveValue(10000);
  });

  it('renders all default payment method radios', () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('radio', { name: 'Tarjeta de crédito/débito' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'PSE (transferencia bancaria)' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Nequi' })).toBeInTheDocument();
  });

  it('selects card payment method by default', () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('radio', { name: 'Tarjeta de crédito/débito' })).toBeChecked();
  });

  it('disables submit button when no amount is entered', () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button', { name: /Donar/ })).toBeDisabled();
  });

  it('calls onSubmit with form data when submitted', async () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('Otro monto');
    await userEvent.type(input, '5000');

    const submitBtn = screen.getByRole('button', { name: /Donar/ });
    await userEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      amount: 5000,
      message: '',
      method: 'card',
    });
  });

  it('does not call onSubmit when amount is zero', async () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('Otro monto');
    await userEvent.type(input, '0');

    const submitBtn = screen.getByRole('button', { name: /Donar/ });
    await userEvent.click(submitBtn);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows processing text when submitting', () => {
    render(<DonationForm onSubmit={mockOnSubmit} submitting={true} />);
    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
  });

  it('renders custom submit label when provided', async () => {
    render(<DonationForm onSubmit={mockOnSubmit} submitLabel="Contribute" />);
    const presetBtn = screen.getByRole('button', { name: /10,000/ });
    await userEvent.click(presetBtn);
    expect(screen.getByRole('button', { name: 'Contribute' })).toBeInTheDocument();
  });

  it('renders with teal accent color variant', () => {
    render(<DonationForm onSubmit={mockOnSubmit} accentColor="teal" />);
    expect(screen.getByRole('button', { name: /Donar/ })).toBeInTheDocument();
  });

  it('allows changing payment method to PSE', async () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);
    const pseRadio = screen.getByRole('radio', { name: 'PSE (transferencia bancaria)' });
    await userEvent.click(pseRadio);
    expect(pseRadio).toBeChecked();
  });

  it('includes message in submit payload', async () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByPlaceholderText('Otro monto');
    await userEvent.type(amountInput, '10000');

    const messageInput = screen.getByPlaceholderText('Un mensaje para el refugio...');
    await userEvent.type(messageInput, 'Thanks!');

    const submitBtn = screen.getByRole('button', { name: /Donar/ });
    await userEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      amount: 10000,
      message: 'Thanks!',
      method: 'card',
    });
  });

  it('highlights selected preset amount button with accent style', async () => {
    render(<DonationForm onSubmit={mockOnSubmit} />);
    const btn = screen.getByRole('button', { name: /25,000/ });
    await userEvent.click(btn);
    expect(btn.className).toContain('text-white');
  });
});
