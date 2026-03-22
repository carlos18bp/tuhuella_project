import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ApplicationStatusBadge from '../ApplicationStatusBadge';

describe('ApplicationStatusBadge', () => {
  it('renders submitted status label', () => {
    render(<ApplicationStatusBadge status="submitted" />);
    expect(screen.getByText('Enviada')).toBeInTheDocument();
  });

  it('renders reviewing status with amber styling', () => {
    render(<ApplicationStatusBadge status="reviewing" />);
    const badge = screen.getByText('En revisión');
    expect(badge).toHaveClass('bg-amber-50', 'text-amber-700');
  });

  it('renders approved status with emerald styling', () => {
    render(<ApplicationStatusBadge status="approved" />);
    const badge = screen.getByText('Aprobada');
    expect(badge).toHaveClass('bg-emerald-50', 'text-emerald-700');
  });

  it('renders rejected status with red styling', () => {
    render(<ApplicationStatusBadge status="rejected" />);
    const badge = screen.getByText('Rechazada');
    expect(badge).toHaveClass('bg-red-50', 'text-red-700');
  });

  it('renders interview status with teal styling', () => {
    render(<ApplicationStatusBadge status="interview" />);
    const badge = screen.getByText('Entrevista');
    expect(badge).toHaveClass('bg-teal-50', 'text-teal-700');
  });

  it('falls back to raw status text for unknown status', () => {
    render(<ApplicationStatusBadge status={'custom_status' as never} />);
    expect(screen.getByText('custom_status')).toBeInTheDocument();
  });
});
