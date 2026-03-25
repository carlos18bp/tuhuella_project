import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/ui', () => ({
  FAQAccordion: () => null,
}));

jest.mock('@/lib/hooks/useFAQs', () => ({
  useFAQsByTopic: () => ({ items: [], loading: false }),
}));

import BuscoAdoptarPage from '../page';

describe('BuscoAdoptarPage', () => {
  it('renders page title', () => {
    render(<BuscoAdoptarPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Busco Adoptar');
  });

  it('renders how it works section', () => {
    render(<BuscoAdoptarPage />);
    expect(screen.getByText('¿Cómo funciona?')).toBeInTheDocument();
  });

  it('renders call-to-action links', () => {
    render(<BuscoAdoptarPage />);
    expect(screen.getByRole('link', { name: 'Mi intención de adopción' })).toHaveAttribute('href', '/my-intent');
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/sign-in');
  });
});
