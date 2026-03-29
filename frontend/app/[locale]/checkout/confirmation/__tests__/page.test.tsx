import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import CheckoutConfirmacionPage from '../page';

let mockSearchParams = new URLSearchParams('type=donation&status=placeholder');

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

describe('CheckoutConfirmacionPage - donation', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams('type=donation&status=placeholder');
  });

  it('renders donation heading', () => {
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Donación registrada');
  });

  it('renders donation description', () => {
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByText(/Tu donación ha sido registrada/)).toBeInTheDocument();
  });

  it('renders placeholder notice for placeholder status', () => {
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByText(/flujo de pago placeholder/)).toBeInTheDocument();
  });

  it('renders explore animals link', () => {
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByText('Explorar animales')).toBeInTheDocument();
  });

  it('renders my donations link for donation type', () => {
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByText('Ver mis donaciones')).toBeInTheDocument();
  });

  it('renders back to home link', () => {
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
  });
});

describe('CheckoutConfirmacionPage - sponsorship', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams('type=sponsorship&status=placeholder');
  });

  it('renders sponsorship heading', () => {
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Apadrinamiento registrado');
  });

  it('renders sponsorship description', () => {
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByText(/Tu apadrinamiento ha sido registrado/)).toBeInTheDocument();
  });

  it('renders my sponsorships link', () => {
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByText('Ver mis apadrinamientos')).toBeInTheDocument();
  });
});

describe('CheckoutConfirmacionPage - real status', () => {
  it('hides placeholder notice for non-placeholder status', () => {
    mockSearchParams = new URLSearchParams('type=donation&status=approved');
    render(<CheckoutConfirmacionPage />);
    expect(screen.queryByText(/flujo de pago placeholder/)).not.toBeInTheDocument();
  });
});

describe('CheckoutConfirmacionPage - default params', () => {
  it('defaults to donation type when type param is missing', () => {
    mockSearchParams = new URLSearchParams('status=placeholder');
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Donación registrada');
  });

  it('defaults to placeholder status when status param is missing', () => {
    mockSearchParams = new URLSearchParams('type=donation');
    render(<CheckoutConfirmacionPage />);
    expect(screen.getByText(/flujo de pago placeholder/)).toBeInTheDocument();
  });
});
