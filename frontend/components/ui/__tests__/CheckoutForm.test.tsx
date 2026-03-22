import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutForm from '../CheckoutForm';

describe('CheckoutForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders recipient name for donation type', () => {
    render(<CheckoutForm type="donation" recipientName="Refugio Esperanza" onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Donación para')).toBeInTheDocument();
    expect(screen.getByText('Refugio Esperanza')).toBeInTheDocument();
  });

  it('renders recipient name for sponsorship type', () => {
    render(<CheckoutForm type="sponsorship" recipientName="Luna" onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Apadrinamiento de')).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('renders preset amount buttons', () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button', { name: /10,000/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /25,000/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /50,000/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /100,000/ })).toBeInTheDocument();
  });

  it('renders custom preset amounts when provided', () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} presetAmounts={[5000, 20000]} />);
    expect(screen.getByRole('button', { name: '$5,000' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '$20,000' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '$10,000' })).toBeNull();
  });

  it('sets amount when preset button is clicked', async () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /25,000/ }));

    const input = screen.getByPlaceholderText('Otro monto');
    expect(input).toHaveValue(25000);
  });

  it('renders all payment method radios', () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('radio', { name: 'Tarjeta de crédito/débito' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'PSE (transferencia bancaria)' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Nequi' })).toBeInTheDocument();
  });

  it('selects card payment method by default', () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('radio', { name: 'Tarjeta de crédito/débito' })).toBeChecked();
  });

  it('disables submit button when no amount is entered', () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find((btn) => btn.getAttribute('type') === 'submit');
    expect(submitBtn).toBeDisabled();
  });

  it('shows total summary when amount is entered', async () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /50,000/ }));

    expect(screen.getByText('Total')).toBeInTheDocument();
    const allMatches = screen.getAllByText(/50,000/);
    expect(allMatches.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onSubmit with form data for donation', async () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Otro monto'), '15000');
    await userEvent.type(screen.getByPlaceholderText('Un mensaje para el refugio...'), 'Gracias!');

    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find((btn) => btn.getAttribute('type') === 'submit')!;
    await userEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      amount: 15000,
      method: 'card',
      message: 'Gracias!',
    });
  });

  it('calls onSubmit with selected payment method', async () => {
    render(<CheckoutForm type="sponsorship" recipientName="Luna" onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Otro monto'), '30000');
    await userEvent.click(screen.getByRole('radio', { name: 'Nequi' }));

    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find((btn) => btn.getAttribute('type') === 'submit')!;
    await userEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      amount: 30000,
      method: 'nequi',
      message: '',
    });
  });

  it('shows processing text when submitting', async () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} submitting={true} />);
    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find((btn) => btn.getAttribute('type') === 'submit');
    expect(submitBtn).toHaveTextContent('Procesando...');
    expect(submitBtn).toBeDisabled();
  });

  it('does not call onSubmit when amount is zero', async () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Otro monto'), '0');

    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find((btn) => btn.getAttribute('type') === 'submit')!;
    await userEvent.click(submitBtn);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
