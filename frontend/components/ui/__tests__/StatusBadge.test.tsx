import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders label text', () => {
    render(<StatusBadge label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies neutral variant styles by default', () => {
    render(<StatusBadge label="Default" />);
    expect(screen.getByText('Default')).toHaveClass('bg-surface-tertiary', 'text-text-secondary');
  });

  it('applies success variant styles', () => {
    render(<StatusBadge label="Done" variant="success" />);
    expect(screen.getByText('Done')).toHaveClass('bg-emerald-50', 'text-emerald-700');
  });

  it('applies error variant styles', () => {
    render(<StatusBadge label="Failed" variant="error" />);
    expect(screen.getByText('Failed')).toHaveClass('bg-red-50', 'text-red-700');
  });

  it('applies small size by default', () => {
    render(<StatusBadge label="Small" />);
    expect(screen.getByText('Small')).toHaveClass('text-xs');
  });

  it('applies medium size when specified', () => {
    render(<StatusBadge label="Medium" size="md" />);
    expect(screen.getByText('Medium')).toHaveClass('text-sm');
  });
});
