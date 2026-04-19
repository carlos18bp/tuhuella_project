import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import MetricCard from '../MetricCard';
import type { LucideIcon } from 'lucide-react';

const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="metric-icon" className={className} />
);

describe('MetricCard', () => {
  it('renders the label text', () => {
    render(
      <MetricCard
        label="Adoptions"
        value={12}
        icon={MockIcon as unknown as LucideIcon}
        color="bg-blue-50"
        iconColor="text-blue-600"
      />,
    );
    expect(screen.getByText('Adoptions')).toBeInTheDocument();
  });

  it('renders a numeric value', () => {
    render(
      <MetricCard
        label="Total"
        value={42}
        icon={MockIcon as unknown as LucideIcon}
        color="bg-green-50"
        iconColor="text-green-600"
      />,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    render(
      <MetricCard
        label="Status"
        value="Active"
        icon={MockIcon as unknown as LucideIcon}
        color="bg-red-50"
        iconColor="text-red-600"
      />,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders the icon element', () => {
    render(
      <MetricCard
        label="Dogs"
        value={5}
        icon={MockIcon as unknown as LucideIcon}
        color="bg-yellow-50"
        iconColor="text-yellow-600"
      />,
    );
    expect(screen.getByTestId('metric-icon')).toBeInTheDocument();
  });

  it('applies the iconColor class to the icon', () => {
    render(
      <MetricCard
        label="Dogs"
        value={5}
        icon={MockIcon as unknown as LucideIcon}
        color="bg-yellow-50"
        iconColor="text-yellow-600"
      />,
    );
    expect(screen.getByTestId('metric-icon')).toHaveClass('text-yellow-600');
  });
});
