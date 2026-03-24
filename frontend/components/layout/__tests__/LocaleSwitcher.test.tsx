import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LocaleSwitcher from '../LocaleSwitcher';

const mockReplace = jest.fn();

jest.mock('next-intl', () => ({
  useLocale: () => 'es',
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/animals',
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('renders ES and EN toggle buttons', () => {
    render(<LocaleSwitcher />);
    expect(screen.getByRole('radio', { name: 'ES' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'EN' })).toBeInTheDocument();
  });

  it('marks current locale as checked', () => {
    render(<LocaleSwitcher />);
    expect(screen.getByRole('radio', { name: 'ES' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'EN' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls router.replace with new locale when toggled', async () => {
    render(<LocaleSwitcher />);
    await userEvent.click(screen.getByRole('radio', { name: 'EN' }));
    expect(mockReplace).toHaveBeenCalledWith('/animals', { locale: 'en' });
  });

  it('does not navigate when clicking current locale', async () => {
    render(<LocaleSwitcher />);
    await userEvent.click(screen.getByRole('radio', { name: 'ES' }));
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
