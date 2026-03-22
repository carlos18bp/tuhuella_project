import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import PaymentConfirmation from '../PaymentConfirmation';

describe('PaymentConfirmation', () => {
  it('renders donation confirmation title', () => {
    render(<PaymentConfirmation type="donation" />);
    expect(screen.getByText('Donación registrada')).toBeInTheDocument();
  });

  it('renders sponsorship confirmation title', () => {
    render(<PaymentConfirmation type="sponsorship" />);
    expect(screen.getByText('Apadrinamiento registrado')).toBeInTheDocument();
  });

  it('renders donation description text', () => {
    render(<PaymentConfirmation type="donation" />);
    expect(screen.getByText(/Tu donación ha sido registrada exitosamente/)).toBeInTheDocument();
  });

  it('renders sponsorship description text', () => {
    render(<PaymentConfirmation type="sponsorship" />);
    expect(screen.getByText(/Tu apadrinamiento ha sido registrado exitosamente/)).toBeInTheDocument();
  });

  it('renders placeholder banner by default', () => {
    render(<PaymentConfirmation type="donation" />);
    expect(screen.getByText(/flujo de pago placeholder/)).toBeInTheDocument();
  });

  it('hides placeholder banner when isPlaceholder is false', () => {
    render(<PaymentConfirmation type="donation" isPlaceholder={false} />);
    expect(screen.queryByText(/flujo de pago placeholder/)).toBeNull();
  });

  it('renders correct navigation links for donation type', () => {
    render(<PaymentConfirmation type="donation" />);
    expect(screen.getByRole('link', { name: 'Explorar animales' })).toHaveAttribute('href', '/animales');
    expect(screen.getByRole('link', { name: 'Ver mis donaciones' })).toHaveAttribute('href', '/mis-donaciones');
  });

  it('renders correct navigation links for sponsorship type', () => {
    render(<PaymentConfirmation type="sponsorship" />);
    expect(screen.getByRole('link', { name: 'Ver mis apadrinamientos' })).toHaveAttribute('href', '/mis-apadrinamientos');
  });
});
