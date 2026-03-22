import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import StatsCounter from '../StatsCounter';

describe('StatsCounter', () => {
  it('renders all stat labels and values', () => {
    const stats = [
      { label: 'Animals', value: '150' },
      { label: 'Shelters', value: '12' },
    ];
    render(<StatsCounter stats={stats} />);

    expect(screen.getByText('Animals')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Shelters')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders no stat items when stats array is empty', () => {
    render(<StatsCounter stats={[]} />);
    expect(screen.queryByText(/./)).toBeNull();
  });
});
