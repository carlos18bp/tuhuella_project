import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders message text', () => {
    render(<EmptyState message="No results found" />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders default icon when none provided', () => {
    render(<EmptyState message="Empty" />);
    expect(screen.getByTestId('icon-empty-default')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(<EmptyState message="Empty" icon="🐾" />);
    expect(screen.getByText('🐾')).toBeInTheDocument();
  });
});
