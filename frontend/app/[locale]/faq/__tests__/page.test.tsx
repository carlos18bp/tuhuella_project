import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/hooks/useFAQs', () => ({
  useAllFAQs: () => ({
    topics: [
      { slug: 'home', display_name: 'General', items: [{ question: 'Q1?', answer: 'A1' }] },
      { slug: 'animals', display_name: 'Adopcion', items: [{ question: 'Q2?', answer: 'A2' }] },
      { slug: 'shelters', display_name: 'Refugios', items: [{ question: 'Q3?', answer: 'A3' }] },
    ],
    loading: false,
  }),
}));

import FaqPage from '../page';

describe('FaqPage', () => {
  it('renders page title', () => {
    render(<FaqPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Preguntas Frecuentes');
  });

  it('renders FAQ section headings', () => {
    render(<FaqPage />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Adopcion')).toBeInTheDocument();
    expect(screen.getByText('Refugios')).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    render(<FaqPage />);
    expect(screen.getByText('Resolvemos tus dudas sobre Tu Huella')).toBeInTheDocument();
  });
});
