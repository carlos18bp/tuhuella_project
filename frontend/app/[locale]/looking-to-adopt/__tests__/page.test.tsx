import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/ui', () => ({
  FAQAccordion: ({ title }: any) => <div data-testid="faq-accordion">{title}</div>,
}));

jest.mock('@/lib/hooks/useFAQs', () => ({
  useFAQsByTopic: jest.fn(() => ({ items: [], loading: false })),
}));

import { useFAQsByTopic } from '@/lib/hooks/useFAQs';
import { useAuthStore } from '@/lib/stores/authStore';

import BuscoAdoptarPage from '../page';

const mockUseFAQsByTopic = useFAQsByTopic as jest.Mock;

describe('BuscoAdoptarPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFAQsByTopic.mockReturnValue({ items: [], loading: false });
  });

  it('renders page title', () => {
    render(<BuscoAdoptarPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Busco Adoptar');
  });

  it('renders how it works section', () => {
    render(<BuscoAdoptarPage />);
    expect(screen.getByText('¿Cómo funciona?')).toBeInTheDocument();
  });

  it('renders sign-in link when not authenticated', () => {
    render(<BuscoAdoptarPage />);
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/sign-in');
  });

  it('renders my-intent link when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: 1 } as any });
    const { unmount } = render(<BuscoAdoptarPage />);
    expect(screen.getByRole('link', { name: 'Mi intención de adopción' })).toHaveAttribute('href', '/my-intent');
    unmount();
    useAuthStore.setState({ isAuthenticated: false, user: null });
  });

  it('renders FAQ section when FAQs are available', () => {
    mockUseFAQsByTopic.mockReturnValue({
      items: [{ id: 1, question: 'Q1', answer: 'A1' }],
      loading: false,
    });
    render(<BuscoAdoptarPage />);
    expect(screen.getByTestId('faq-accordion')).toBeInTheDocument();
  });
});
