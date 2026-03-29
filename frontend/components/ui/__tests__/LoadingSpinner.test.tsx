import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default medium size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-5', 'h-5');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });
});
