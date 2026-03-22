import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useLocaleStore } from '@/lib/stores/localeStore';

import LocaleSwitcher from '../LocaleSwitcher';

describe('LocaleSwitcher', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders select with current locale value', () => {
    render(<LocaleSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Select language' });
    expect(select).toHaveValue('en');
  });

  it('renders all supported locale options', () => {
    render(<LocaleSwitcher />);
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Español' })).toBeInTheDocument();
  });

  it('updates locale store when selection changes', async () => {
    render(<LocaleSwitcher />);
    const select = screen.getByRole('combobox', { name: 'Select language' });

    await userEvent.selectOptions(select, 'es');

    expect(useLocaleStore.getState().locale).toBe('es');
  });
});
