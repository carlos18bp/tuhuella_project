import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MultiSelectDropdown from '../MultiSelectDropdown';

jest.mock('lucide-react', () => ({
  ChevronDown: (props: any) => <svg data-testid="chevron-down" {...props} />,
  Check: (props: any) => <svg data-testid="check-icon" {...props} />,
}));

const options = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'rabbit', label: 'Rabbit' },
];

const defaultProps = {
  label: 'Species',
  options,
  selected: [],
  onChange: jest.fn(),
};

describe('MultiSelectDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with label when nothing is selected', () => {
    render(<MultiSelectDropdown {...defaultProps} selected={[]} />);
    expect(screen.getByRole('button', { name: /Species/i })).toBeInTheDocument();
    expect(screen.getByText('Species')).toBeInTheDocument();
  });

  it('shows the option label when one item is selected', () => {
    render(<MultiSelectDropdown {...defaultProps} selected={['cat']} />);
    expect(screen.getByText('Cat')).toBeInTheDocument();
  });

  it('shows count in label when multiple items are selected', () => {
    render(<MultiSelectDropdown {...defaultProps} selected={['dog', 'cat']} />);
    expect(screen.getByText('Species (2)')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', async () => {
    const user = userEvent.setup();
    render(<MultiSelectDropdown {...defaultProps} selected={[]} />);

    expect(screen.queryByText('Dog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Species/i }));

    expect(screen.getByText('Dog')).toBeInTheDocument();
    expect(screen.getByText('Cat')).toBeInTheDocument();
    expect(screen.getByText('Rabbit')).toBeInTheDocument();
  });

  it('closes dropdown when button is clicked again', async () => {
    const user = userEvent.setup();
    render(<MultiSelectDropdown {...defaultProps} selected={[]} />);

    await user.click(screen.getByRole('button', { name: /Species/i }));
    expect(screen.getByText('Dog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Species/i }));
    expect(screen.queryByText('Dog')).not.toBeInTheDocument();
  });

  it('calls onChange with added value when an unselected option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiSelectDropdown {...defaultProps} selected={[]} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /Species/i }));
    await user.click(screen.getByText('Dog'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['dog']);
  });

  it('calls onChange with value removed when a selected option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <MultiSelectDropdown {...defaultProps} selected={['dog', 'cat']} onChange={onChange} />
    );

    await user.click(screen.getByRole('button', { name: /Species \(2\)/i }));
    await user.click(screen.getByText('Dog'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['cat']);
  });

  it('does not show clear button when nothing is selected', async () => {
    const user = userEvent.setup();
    render(<MultiSelectDropdown {...defaultProps} selected={[]} />);

    await user.click(screen.getByRole('button', { name: /Species/i }));

    expect(screen.queryByText('Limpiar filtro')).not.toBeInTheDocument();
  });

  it('shows clear button when at least one item is selected', async () => {
    const user = userEvent.setup();
    render(<MultiSelectDropdown {...defaultProps} selected={['dog']} />);

    await user.click(screen.getByRole('button', { name: /Dog/i }));

    expect(screen.getByText('Limpiar filtro')).toBeInTheDocument();
  });

  it('calls onChange with empty array when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiSelectDropdown {...defaultProps} selected={['dog', 'cat']} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /Species \(2\)/i }));
    await user.click(screen.getByText('Limpiar filtro'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('closes dropdown when clicking outside the component', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <MultiSelectDropdown {...defaultProps} selected={[]} />
        <button type="button">Outside button</button>
      </div>
    );

    await user.click(screen.getByRole('button', { name: /Species/i }));
    expect(screen.getByText('Dog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Outside button/i }));
    expect(screen.queryByText('Dog')).not.toBeInTheDocument();
  });

  it('has correct data-testid on container', () => {
    render(<MultiSelectDropdown {...defaultProps} label="Especie" />);
    expect(screen.getByTestId('filter-Especie')).toBeInTheDocument();
  });

  it('renders chevron icon inside the toggle button', () => {
    render(<MultiSelectDropdown {...defaultProps} selected={[]} />);
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('renders check icon only for selected options inside open dropdown', async () => {
    const user = userEvent.setup();
    render(<MultiSelectDropdown {...defaultProps} selected={['cat']} />);

    await user.click(screen.getByRole('button', { name: /Cat/i }));

    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });
});
