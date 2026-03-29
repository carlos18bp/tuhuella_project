import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import Hero from '../Hero';

describe('Hero', () => {
  it('renders title content', () => {
    render(<Hero title="Welcome Home" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome Home');
  });

  it('renders badge when provided', () => {
    render(<Hero title="Welcome" badge="New!" />);
    expect(screen.getByText('New!')).toBeInTheDocument();
  });

  it('does not render badge when not provided', () => {
    render(<Hero title="Welcome" />);
    expect(screen.queryByText('New!')).toBeNull();
  });

  it('renders subtitle when provided', () => {
    render(<Hero title="Welcome" subtitle="Find your companion" />);
    expect(screen.getByText('Find your companion')).toBeInTheDocument();
  });

  it('renders CTA links when provided', () => {
    const ctas = [
      { label: 'Get Started', href: '/start' },
      { label: 'Learn More', href: '/about', variant: 'secondary' as const },
    ];
    render(<Hero title="Welcome" ctas={ctas} />);
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/start');
    expect(screen.getByRole('link', { name: 'Learn More' })).toHaveAttribute('href', '/about');
  });

  it('does not render CTA section when ctas is empty', () => {
    render(<Hero title="Welcome" ctas={[]} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders children when provided', () => {
    render(<Hero title="Welcome"><p>Extra content</p></Hero>);
    expect(screen.getByText('Extra content')).toBeInTheDocument();
  });
});
