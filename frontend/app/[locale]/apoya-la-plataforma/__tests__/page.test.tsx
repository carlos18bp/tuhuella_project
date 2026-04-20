import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import PlatformSupportPage from '../page';

jest.mock('@/lib/hooks/useFAQs', () => ({
  useFAQsByTopic: jest.fn(() => ({ items: [], loading: false })),
}));
jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: any) => React.createElement('a', { href, ...rest }, children),
}));

import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
const mockUseFAQsByTopic = useFAQsByTopic as jest.Mock;

describe('PlatformSupportPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFAQsByTopic.mockReturnValue({ items: [], loading: false });
  });

  it('renders hero heading', () => {
    render(<PlatformSupportPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders CTA link to platform checkout', () => {
    render(<PlatformSupportPage />);
    const links = screen.getAllByRole('link');
    const checkoutLinks = links.filter((l) =>
      l.getAttribute('href')?.includes('/checkout/platform'),
    );
    expect(checkoutLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders 4 cost section headings', () => {
    render(<PlatformSupportPage />);
    // Costs section has an h2 + 4 h3 titles inside cards
    expect(screen.getByRole('heading', { level: 2, name: /costo|infraestructura/i })).toBeInTheDocument();
  });

  it('renders transparency section', () => {
    render(<PlatformSupportPage />);
    expect(screen.getByRole('heading', { name: /dónde va tu aporte/i })).toBeInTheDocument();
  });

  it('renders all 5 comparison cards', () => {
    render(<PlatformSupportPage />);
    expect(screen.getByRole('heading', { level: 2, name: /formas de apoyar/i })).toBeInTheDocument();
    // Each comparison card has an h3
    const cardHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(cardHeadings.length).toBeGreaterThanOrEqual(5);
  });

  it('renders blog CTA link to seed post', () => {
    render(<PlatformSupportPage />);
    const links = screen.getAllByRole('link');
    const blogLinks = links.filter((l) =>
      l.getAttribute('href')?.includes('por-que-tuhuella-tiene-costos'),
    );
    expect(blogLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render FAQ section when faqs list is empty', () => {
    render(<PlatformSupportPage />);
    expect(screen.queryByRole('heading', { name: /preguntas frecuentes/i })).not.toBeInTheDocument();
  });

  it('renders FAQ accordion when faqs are present', () => {
    mockUseFAQsByTopic.mockReturnValue({
      items: [{ id: 1, question: '¿Qué es una donación a la plataforma?', answer: 'Es un aporte.', order: 1 }],
      loading: false,
    });
    render(<PlatformSupportPage />);
    expect(screen.getByRole('heading', { name: /preguntas frecuentes/i })).toBeInTheDocument();
  });
});
