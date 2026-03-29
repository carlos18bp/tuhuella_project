import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutForm from '../CheckoutForm';

jest.mock('../TermsModal', () => function MockTermsModal({ open, onAccept, onClose, showActions }: any) {
  if (!open) return null;
  return (
    <div data-testid="terms-modal">
      {showActions && <button data-testid="accept-terms" onClick={onAccept}>Accept</button>}
      <button data-testid="close-terms-modal" onClick={onClose}>Close</button>
    </div>
  );
});

describe('CheckoutForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const acceptTerms = async () => {
    const termsCheckbox = screen.getByRole('checkbox');
    await userEvent.click(termsCheckbox);
  };

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
    await acceptTerms();

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
    await acceptTerms();

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
    await acceptTerms();

    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find((btn) => btn.getAttribute('type') === 'submit')!;
    await userEvent.click(submitBtn);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // New terms-specific tests

  it('renders terms acceptance checkbox', () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText(/acepto los/i)).toBeInTheDocument();
  });

  it('disables submit when terms not accepted even with valid amount', async () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /25,000/ }));

    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find((btn) => btn.getAttribute('type') === 'submit');
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit when terms accepted and amount is valid', async () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /25,000/ }));
    await acceptTerms();

    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find((btn) => btn.getAttribute('type') === 'submit');
    expect(submitBtn).not.toBeDisabled();
  });

  it('renders terms link button', () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Términos y Condiciones')).toBeInTheDocument();
  });

  it('accepts terms and closes modal when onAccept is triggered from TermsModal', async () => {
    render(<CheckoutForm type="donation" recipientName="Test" onSubmit={mockOnSubmit} />);

    // Open the terms modal via the link button
    await userEvent.click(screen.getByText('Términos y Condiciones'));
    expect(screen.getByTestId('terms-modal')).toBeInTheDocument();

    // Accept terms from inside the modal
    await userEvent.click(screen.getByTestId('accept-terms'));

    // Modal closes and terms checkbox is now checked
    expect(screen.queryByTestId('terms-modal')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
