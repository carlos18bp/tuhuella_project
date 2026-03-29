import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'motion-div', ...props }, children),
  },
}));

import PageTransition from '../PageTransition';

describe('PageTransition', () => {
  it('renders children content', () => {
    render(<PageTransition><p>Page content</p></PageTransition>);
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('wraps children in a motion container', () => {
    render(<PageTransition><p>Wrapped</p></PageTransition>);
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });
});
