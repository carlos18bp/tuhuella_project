import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import VerifiedBadge from '../VerifiedBadge';

describe('VerifiedBadge', () => {
  it('renders verified status label', () => {
    render(<VerifiedBadge status="verified" />);
    expect(screen.getByText('Verificado')).toBeInTheDocument();
  });

  it('renders verified status with emerald styling', () => {
    render(<VerifiedBadge status="verified" />);
    expect(screen.getByText('Verificado')).toHaveClass('bg-emerald-50', 'text-emerald-700');
  });

  it('renders pending status with amber styling', () => {
    render(<VerifiedBadge status="pending" />);
    expect(screen.getByText('Pendiente de verificación')).toHaveClass('bg-amber-50', 'text-amber-700');
  });

  it('renders rejected status with red styling', () => {
    render(<VerifiedBadge status="rejected" />);
    expect(screen.getByText('Rechazado')).toHaveClass('bg-red-50', 'text-red-700');
  });

  it('applies small size by default', () => {
    render(<VerifiedBadge status="verified" />);
    expect(screen.getByText('Verificado')).toHaveClass('text-xs');
  });

  it('applies medium size when specified', () => {
    render(<VerifiedBadge status="verified" size="md" />);
    expect(screen.getByText('Verificado')).toHaveClass('text-sm');
  });

  it('falls back to pending config for unknown status', () => {
    render(<VerifiedBadge status={'unknown' as never} />);
    expect(screen.getByText('Pendiente de verificación')).toBeInTheDocument();
  });
});
