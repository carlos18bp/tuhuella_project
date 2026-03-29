import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ApplicationTimeline from '../ApplicationTimeline';

describe('ApplicationTimeline', () => {
  it('renders all four step labels', () => {
    render(<ApplicationTimeline status="submitted" />);
    expect(screen.getByText('Enviada')).toBeInTheDocument();
    expect(screen.getByText('En revisión')).toBeInTheDocument();
    expect(screen.getByText('Entrevista')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
  });

  it('renders with role list for accessibility', () => {
    render(<ApplicationTimeline status="submitted" />);
    expect(screen.getByRole('list', { name: 'Estado de la solicitud' })).toBeInTheDocument();
  });

  it('renders four list items', () => {
    render(<ApplicationTimeline status="submitted" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('does not show rejected alert for submitted status', () => {
    render(<ApplicationTimeline status="submitted" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not show rejected alert for reviewing status', () => {
    render(<ApplicationTimeline status="reviewing" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not show rejected alert for interview status', () => {
    render(<ApplicationTimeline status="interview" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not show rejected alert for approved status', () => {
    render(<ApplicationTimeline status="approved" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows rejected alert when status is rejected', () => {
    render(<ApplicationTimeline status="rejected" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Solicitud rechazada')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<ApplicationTimeline status="submitted" className="mt-8" />);
    expect(container.firstChild).toHaveClass('mt-8');
  });

  it('renders correctly for approved status without rejected alert', () => {
    render(<ApplicationTimeline status="approved" />);
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    expect(screen.queryByText('Solicitud rechazada')).toBeNull();
  });
});
