import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import FaqPage from '../page';

describe('FaqPage', () => {
  it('renders page title', () => {
    render(<FaqPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Preguntas Frecuentes');
  });

  it('renders all FAQ questions', () => {
    render(<FaqPage />);
    expect(screen.getByText('¿Cómo funciona el proceso de adopción?')).toBeInTheDocument();
    expect(screen.getByText('¿Qué es apadrinar un animal?')).toBeInTheDocument();
    expect(screen.getByText('¿Puedo donar sin adoptar?')).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    render(<FaqPage />);
    expect(screen.getByText('Resolvemos tus dudas sobre Mi Huella')).toBeInTheDocument();
  });
});
