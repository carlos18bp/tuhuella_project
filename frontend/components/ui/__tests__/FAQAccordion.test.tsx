import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import FAQAccordion from '../FAQAccordion';

describe('FAQAccordion', () => {
  const items = [
    { question: 'How to adopt?', answer: 'Fill out the form.' },
    { question: 'What is sponsorship?', answer: 'Monthly support.' },
  ];

  it('renders all question headings', () => {
    render(<FAQAccordion items={items} />);
    expect(screen.getByText('How to adopt?')).toBeInTheDocument();
    expect(screen.getByText('What is sponsorship?')).toBeInTheDocument();
  });

  it('renders all answer texts', () => {
    render(<FAQAccordion items={items} />);
    expect(screen.getByText('Fill out the form.')).toBeInTheDocument();
    expect(screen.getByText('Monthly support.')).toBeInTheDocument();
  });

  it('renders nothing when items array is empty', () => {
    render(<FAQAccordion items={[]} />);
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
  });
});
