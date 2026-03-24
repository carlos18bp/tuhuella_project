import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import FaqPage from '../page';

describe('FaqPage', () => {
  it('renders page title', () => {
    render(<FaqPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Preguntas Frecuentes');
  });

  it('renders FAQ section headings', () => {
    render(<FaqPage />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Adopción')).toBeInTheDocument();
    expect(screen.getByText('Refugios')).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    render(<FaqPage />);
    expect(screen.getByText('Resolvemos tus dudas sobre Tu Huella')).toBeInTheDocument();
  });
});
