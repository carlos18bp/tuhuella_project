import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import Container from '../Container';

describe('Container', () => {
  it('renders children content', () => {
    render(
      <Container>
        <p>Child content</p>
      </Container>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('applies default container classes', () => {
    render(
      <Container>
        <p>Content</p>
      </Container>
    );
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('mx-auto', 'max-w-[1400px]', 'px-6');
  });

  it('merges additional className', () => {
    render(
      <Container className="py-12 text-center">
        <p>Content</p>
      </Container>
    );
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('mx-auto', 'max-w-[1400px]', 'px-6', 'py-12', 'text-center');
  });
});
