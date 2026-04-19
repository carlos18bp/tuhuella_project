import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import AdminAccessDenied from '../AdminAccessDenied';

describe('AdminAccessDenied', () => {
  it('renders children text', () => {
    render(<AdminAccessDenied>Access denied to this area</AdminAccessDenied>);
    expect(screen.getByText('Access denied to this area')).toBeInTheDocument();
  });

  it('applies the default max-width class', () => {
    const { container } = render(<AdminAccessDenied>msg</AdminAccessDenied>);
    expect(container.firstChild).toHaveClass('max-w-[1400px]');
  });

  it('applies a custom maxWidthClass when provided', () => {
    const { container } = render(
      <AdminAccessDenied maxWidthClass="max-w-xl">msg</AdminAccessDenied>,
    );
    expect(container.firstChild).toHaveClass('max-w-xl');
    expect(container.firstChild).not.toHaveClass('max-w-[1400px]');
  });

  it('applies an extra className when provided', () => {
    const { container } = render(
      <AdminAccessDenied className="my-custom-class">msg</AdminAccessDenied>,
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
