import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'motion-div', ...props }, children),
  },
}));

import Template from '../template';

describe('Template', () => {
  it('renders children inside page transition', () => {
    render(<Template><p>Hello</p></Template>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });
});
