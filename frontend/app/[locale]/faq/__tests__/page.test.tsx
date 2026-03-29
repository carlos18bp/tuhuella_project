import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

const mockUseAllFAQs = jest.fn();

jest.mock('@/lib/hooks/useFAQs', () => ({
  useAllFAQs: () => mockUseAllFAQs(),
}));

import FaqPage from '../page';

describe('FaqPage', () => {
  it('renders page title', () => {
    mockUseAllFAQs.mockReturnValue({
      topics: [
        { slug: 'home', display_name: 'General', items: [{ question: 'Q1?', answer: 'A1' }] },
        { slug: 'animals', display_name: 'Adopcion', items: [{ question: 'Q2?', answer: 'A2' }] },
        { slug: 'shelters', display_name: 'Refugios', items: [{ question: 'Q3?', answer: 'A3' }] },
      ],
      loading: false,
    });
    render(<FaqPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Preguntas Frecuentes');
  });

  it('renders FAQ section headings', () => {
    mockUseAllFAQs.mockReturnValue({
      topics: [
        { slug: 'home', display_name: 'General', items: [{ question: 'Q1?', answer: 'A1' }] },
        { slug: 'animals', display_name: 'Adopcion', items: [{ question: 'Q2?', answer: 'A2' }] },
        { slug: 'shelters', display_name: 'Refugios', items: [{ question: 'Q3?', answer: 'A3' }] },
      ],
      loading: false,
    });
    render(<FaqPage />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Adopcion')).toBeInTheDocument();
    expect(screen.getByText('Refugios')).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    mockUseAllFAQs.mockReturnValue({
      topics: [],
      loading: false,
    });
    render(<FaqPage />);
    expect(screen.getByText('Resolvemos tus dudas sobre Tu Huella')).toBeInTheDocument();
  });

  it('renders loading skeletons when loading is true', () => {
    mockUseAllFAQs.mockReturnValue({
      topics: [],
      loading: true,
    });
    render(<FaqPage />);
    const skeletons = document.querySelectorAll('.animate-shimmer');
    expect(skeletons.length).toBe(3);
  });

  it('does not render FAQ accordions while loading', () => {
    mockUseAllFAQs.mockReturnValue({
      topics: [{ slug: 'home', display_name: 'General', items: [] }],
      loading: true,
    });
    render(<FaqPage />);
    expect(screen.queryByText('General')).not.toBeInTheDocument();
  });
});
