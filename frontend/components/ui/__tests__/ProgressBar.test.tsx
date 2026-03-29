import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct percentage width', () => {
    render(<ProgressBar percentage={50} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '50%' });
  });

  it('clamps percentage at 0 for negative values', () => {
    render(<ProgressBar percentage={-10} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '0%' });
  });

  it('clamps percentage at 100 for values above 100', () => {
    render(<ProgressBar percentage={150} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '100%' });
  });

  it('renders zero percentage correctly', () => {
    render(<ProgressBar percentage={0} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '0%' });
  });
});
