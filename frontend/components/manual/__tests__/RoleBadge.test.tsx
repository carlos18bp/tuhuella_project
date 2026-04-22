import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import RoleBadge from '../RoleBadge';

describe('RoleBadge', () => {
  it('renders the translated audience label for public', () => {
    render(<RoleBadge audience="public" />);

    expect(screen.getByText('Público')).toBeInTheDocument();
  });

  it('applies the correct style class for adopter audience', () => {
    const { container } = render(<RoleBadge audience="adopter" />);

    expect(container.firstChild).toHaveClass('bg-teal-100');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<RoleBadge audience="admin" className="ml-2" />);

    expect(container.firstChild).toHaveClass('ml-2');
    expect(container.firstChild).toHaveClass('bg-rose-100');
  });

  it('renders veterinarian audience with correct styles', () => {
    const { container } = render(<RoleBadge audience="veterinarian" />);

    expect(screen.getByText('Veterinario')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-sky-100');
  });
});
