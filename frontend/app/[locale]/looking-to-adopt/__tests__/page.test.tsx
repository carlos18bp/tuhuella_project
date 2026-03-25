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

  it('renders sign-in link when not authenticated', () => {
    render(<BuscoAdoptarPage />);
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/sign-in');
  });
});
