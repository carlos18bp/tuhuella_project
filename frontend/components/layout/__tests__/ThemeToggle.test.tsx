import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

import { useTheme } from 'next-themes';
import ThemeToggle from '../ThemeToggle';

const mockUseTheme = useTheme as jest.Mock;

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button in light mode with dark switch label', () => {
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: jest.fn() });
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Cambiar a modo oscuro' })).toBeInTheDocument();
  });

  it('renders button in dark mode with light switch label', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark', setTheme: jest.fn() });
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeInTheDocument();
  });

  it('calls setTheme with light when toggling from dark', async () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme });
    render(<ThemeToggle />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Cambiar a modo claro' }));

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls setTheme with dark when toggling from light', async () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });
    render(<ThemeToggle />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
