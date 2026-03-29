import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnimalFilters from '../AnimalFilters';

const defaultProps = {
  species: '',
  size: '',
  ageRange: '',
  onSpeciesChange: jest.fn(),
  onSizeChange: jest.fn(),
  onAgeRangeChange: jest.fn(),
};

describe('AnimalFilters', () => {
  it('renders species select with all options', () => {
    render(<AnimalFilters {...defaultProps} />);
    expect(screen.getByDisplayValue('Todas las especies')).toBeInTheDocument();
  });

  it('renders size select with all options', () => {
    render(<AnimalFilters {...defaultProps} />);
    expect(screen.getByDisplayValue('Todos los tamaños')).toBeInTheDocument();
  });

  it('renders age range select with all options', () => {
    render(<AnimalFilters {...defaultProps} />);
    expect(screen.getByDisplayValue('Todas las edades')).toBeInTheDocument();
  });

  it('calls onSpeciesChange when species select changes', async () => {
    const onSpeciesChange = jest.fn();
    render(<AnimalFilters {...defaultProps} onSpeciesChange={onSpeciesChange} />);

    const speciesSelect = screen.getByDisplayValue('Todas las especies');
    await userEvent.selectOptions(speciesSelect, 'dog');

    expect(onSpeciesChange).toHaveBeenCalledWith('dog');
  });

  it('calls onSizeChange when size select changes', async () => {
    const onSizeChange = jest.fn();
    render(<AnimalFilters {...defaultProps} onSizeChange={onSizeChange} />);

    const sizeSelect = screen.getByDisplayValue('Todos los tamaños');
    await userEvent.selectOptions(sizeSelect, 'small');

    expect(onSizeChange).toHaveBeenCalledWith('small');
  });

  it('calls onAgeRangeChange when age select changes', async () => {
    const onAgeRangeChange = jest.fn();
    render(<AnimalFilters {...defaultProps} onAgeRangeChange={onAgeRangeChange} />);

    const ageSelect = screen.getByDisplayValue('Todas las edades');
    await userEvent.selectOptions(ageSelect, 'puppy');

    expect(onAgeRangeChange).toHaveBeenCalledWith('puppy');
  });
});
