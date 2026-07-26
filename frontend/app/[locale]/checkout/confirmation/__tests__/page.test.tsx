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

describe('CheckoutConfirmacionPage - failed payment status', () => {
  // Bug: before the fix, the only status branch was isPlaceholder (status
  // === 'placeholder'). Every other status value fell through to the exact
  // same copy as an approved payment. A declined/errored/failed/voided
  // payment showed "Tu donación ha sido registrada exitosamente. Gracias
  // por tu generosidad." — a rejected payment telling the user their
  // donation went through, making them believe they donated when they did
  // not. This was not observable from the 'approved' test above, which
  // never exercises a failure status.
  it.each(['declined', 'error', 'failed', 'voided'])(
    'shows the payment-failed message instead of the success copy for status=%s',
    (status) => {
      mockSearchParams = new URLSearchParams(`type=donation&status=${status}`);
      render(<CheckoutConfirmacionPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tu donación no pudo procesarse');
      expect(screen.queryByText(/registrada exitosamente/i)).not.toBeInTheDocument();
    }
  );

  // Bug: the primary CTA used to be hardcoded to ROUTES.ANIMALS for every
  // status. A user whose payment failed would see no way back into
  // checkout — this pins the href so swapping it back to /animals (or any
  // other route) fails the test.
  it('points the retry CTA at the donation checkout, not the animals list', () => {
    mockSearchParams = new URLSearchParams('type=donation&status=declined');
    render(<CheckoutConfirmacionPage />);

    expect(screen.getByText('Intentar de nuevo').closest('a')).toHaveAttribute('href', '/checkout/donation');
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
