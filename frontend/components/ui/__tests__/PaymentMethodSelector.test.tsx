import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PaymentMethodSelector from '../PaymentMethodSelector';

describe('PaymentMethodSelector', () => {
  const defaultProps = {
    selected: 'card',
    onChange: jest.fn(),
  };

  it('renders default payment methods', () => {
    render(<PaymentMethodSelector {...defaultProps} />);
    expect(screen.getByText('Tarjeta de crédito/débito')).toBeInTheDocument();
    expect(screen.getByText('PSE (transferencia bancaria)')).toBeInTheDocument();
    expect(screen.getByText('Nequi')).toBeInTheDocument();
  });

  it('renders the selected radio as checked', () => {
    render(<PaymentMethodSelector {...defaultProps} selected="pse" />);
    const pseRadio = screen.getByRole('radio', { name: 'PSE (transferencia bancaria)' });
    expect(pseRadio).toBeChecked();
  });

  it('calls onChange when a different method is selected', async () => {
    const onChange = jest.fn();
    render(<PaymentMethodSelector {...defaultProps} onChange={onChange} />);

    const nequiRadio = screen.getByRole('radio', { name: 'Nequi' });
    await userEvent.click(nequiRadio);

    expect(onChange).toHaveBeenCalledWith('nequi');
  });

  it('renders custom methods when provided', () => {
    const customMethods = [
      { value: 'bitcoin', label: 'Bitcoin' },
    ];
    render(<PaymentMethodSelector {...defaultProps} methods={customMethods} />);
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.queryByText('Nequi')).toBeNull();
  });
});
