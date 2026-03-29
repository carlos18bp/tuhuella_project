import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import HowItWorks from '../HowItWorks';

describe('HowItWorks', () => {
  it('renders default title', () => {
    render(<HowItWorks />);
    expect(screen.getByText('¿Cómo funciona?')).toBeInTheDocument();
  });

  it('renders default subtitle', () => {
    render(<HowItWorks />);
    expect(screen.getByText('Tres pasos sencillos para transformar una vida')).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(<HowItWorks title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders default step titles', () => {
    render(<HowItWorks />);
    expect(screen.getByText('Explora')).toBeInTheDocument();
    expect(screen.getByText('Conecta')).toBeInTheDocument();
    expect(screen.getByText('Transforma')).toBeInTheDocument();
  });

  it('renders custom steps when provided', () => {
    const customSteps = [
      { number: 1, title: 'Step A', description: 'Do A', accentColor: 'bg-red-50 text-red-600' },
    ];
    render(<HowItWorks steps={customSteps} />);
    expect(screen.getByText('Step A')).toBeInTheDocument();
    expect(screen.getByText('Do A')).toBeInTheDocument();
  });
});
