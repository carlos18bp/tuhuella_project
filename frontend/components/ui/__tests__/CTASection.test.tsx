import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import CTASection from '../CTASection';

describe('CTASection', () => {
  it('renders title heading', () => {
    render(
      <CTASection title="Featured" linkHref="/animals" linkLabel="See all">
        <p>Content</p>
      </CTASection>
    );
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <CTASection title="Featured" subtitle="Best picks" linkHref="/animals" linkLabel="See all">
        <p>Content</p>
      </CTASection>
    );
    expect(screen.getByText('Best picks')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(
      <CTASection title="Featured" linkHref="/animals" linkLabel="See all">
        <p>Content</p>
      </CTASection>
    );
    expect(screen.queryByText('Best picks')).toBeNull();
  });

  it('renders link with correct href', () => {
    render(
      <CTASection title="Featured" linkHref="/animals" linkLabel="See all">
        <p>Content</p>
      </CTASection>
    );
    const link = screen.getByRole('link', { name: /See all/ });
    expect(link).toHaveAttribute('href', '/animals');
  });

  it('renders children content', () => {
    render(
      <CTASection title="Featured" linkHref="/animals" linkLabel="See all">
        <p>Child content here</p>
      </CTASection>
    );
    expect(screen.getByText('Child content here')).toBeInTheDocument();
  });

  it('applies heading-decorated class when decorated is true', () => {
    render(
      <CTASection title="Featured" linkHref="/animals" linkLabel="See all" decorated>
        <p>Content</p>
      </CTASection>
    );
    const heading = screen.getByRole('heading', { name: 'Featured' });
    expect(heading).toHaveClass('heading-decorated');
  });

  it('does not apply heading-decorated class by default', () => {
    render(
      <CTASection title="Featured" linkHref="/animals" linkLabel="See all">
        <p>Content</p>
      </CTASection>
    );
    const heading = screen.getByRole('heading', { name: 'Featured' });
    expect(heading).not.toHaveClass('heading-decorated');
  });
});
