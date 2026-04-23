import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ProcessCard from '../ProcessCard';
import type { ManualProcess } from '@/lib/manual/types';

const buildProcess = (overrides: Partial<ManualProcess> = {}): ManualProcess => ({
  id: 'p1',
  audience: 'adopter',
  title: { es: 'Adoptar', en: 'Adopt' },
  summary: { es: 'Resumen', en: 'Summary' },
  why: { es: 'Porque', en: 'Why' },
  steps: { es: ['Paso 1', 'Paso 2'], en: ['Step 1', 'Step 2'] },
  keywords: [],
  ...overrides,
});

describe('ProcessCard', () => {
  it('renders title and summary in the active locale', () => {
    render(<ProcessCard process={buildProcess()} locale="es" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Adoptar' })).toBeInTheDocument();
    expect(screen.getByText('Resumen')).toBeInTheDocument();
  });

  it('renders english text when locale is en', () => {
    render(<ProcessCard process={buildProcess()} locale="en" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Adopt' })).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('renders why text', () => {
    render(<ProcessCard process={buildProcess()} locale="es" />);
    expect(screen.getByText('Porque')).toBeInTheDocument();
  });

  it('renders steps as ordered list items', () => {
    render(<ProcessCard process={buildProcess()} locale="es" />);
    expect(screen.getByText('Paso 1')).toBeInTheDocument();
    expect(screen.getByText('Paso 2')).toBeInTheDocument();
  });

  it('renders route when provided', () => {
    render(
      <ProcessCard process={buildProcess({ route: '/adopt' })} locale="es" />,
    );
    expect(screen.getByText('/adopt')).toBeInTheDocument();
  });

  it('omits the route section when it is not provided', () => {
    render(<ProcessCard process={buildProcess()} locale="es" />);
    expect(screen.queryByText('/adopt')).not.toBeInTheDocument();
  });

  it('renders tips when provided for the current locale', () => {
    render(
      <ProcessCard
        process={buildProcess({ tips: { es: ['Tip uno'], en: ['Tip one'] } })}
        locale="es"
      />,
    );
    expect(screen.getByText('Tip uno')).toBeInTheDocument();
  });

  it('omits the tips section when tips list is empty for the locale', () => {
    render(
      <ProcessCard
        process={buildProcess({ tips: { es: [], en: ['Tip'] } })}
        locale="es"
      />,
    );
    expect(screen.queryByText('Tip')).not.toBeInTheDocument();
  });

  it('sets id attribute to process id for anchor links', () => {
    const { container } = render(<ProcessCard process={buildProcess()} locale="es" />);
    // quality: allow-fragile-selector (testing id attribute assignment; no ARIA equivalent for anchor targets)
    expect(container.querySelector('#p1')).not.toBeNull();
  });

  it('renders a RoleBadge for the process audience', () => {
    render(<ProcessCard process={buildProcess({ audience: 'veterinarian' })} locale="es" />);
    // audience label comes from i18n namespace; at minimum the badge span renders
    const article = screen.getByRole('article');
    // quality: allow-fragile-selector (badge span has no ARIA role; presence check only)
    expect(article.querySelector('span.rounded-full')).not.toBeNull();
  });

  it('renders route section when only route is provided', () => {
    render(
      <ProcessCard
        process={buildProcess({ route: '/only-route' })}
        locale="es"
      />,
    );
    expect(screen.getByText('/only-route')).toBeInTheDocument();
  });
});
