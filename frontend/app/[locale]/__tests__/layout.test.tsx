import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

const mockNotFound = jest.fn();

jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
  useMessages: () => ({}),
  useNow: () => new Date(),
  useTimeZone: () => 'America/Bogota',
  NextIntlClientProvider: ({ children }: any) => <div data-testid="intl-provider">{children}</div>,
  hasLocale: (locales: string[], locale: string) => locales.includes(locale),
}));

jest.mock('@/i18n/routing', () => ({
  routing: { locales: ['es', 'en'], defaultLocale: 'es' },
}));

jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

jest.mock('@/components/layout/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />,
}));

jest.mock('../providers', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="providers">{children}</div>,
}));

import LocaleLayout from '../layout';

describe('LocaleLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header, children, and footer for valid locale', async () => {
    const Layout = await LocaleLayout({
      children: <span>Page content</span>,
      params: Promise.resolve({ locale: 'es' }),
    });

    render(Layout as React.ReactElement);

    expect(screen.getByTestId('intl-provider')).toBeInTheDocument();
    expect(screen.getByTestId('providers')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('calls notFound for invalid locale', async () => {
    await LocaleLayout({
      children: <span>Page content</span>,
      params: Promise.resolve({ locale: 'fr' }),
    });

    expect(mockNotFound).toHaveBeenCalled();
  });
});
