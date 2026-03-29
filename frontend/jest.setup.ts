import React from 'react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/jest-globals';

jest.mock('next/image', () => ({
  __esModule: true,
  default: function NextImage(props: any) {
    const { fill, ...rest } = props;
    return React.createElement('img', { ...rest, alt: props.alt });
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => React.createElement('a', { href, ...rest }, children),
}));

// Mock next-intl to avoid ESM transformation issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const esMessages = require('./messages/es.json');

function resolveNestedKey(obj: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
    return undefined;
  }, obj);
}

jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const messages = namespace ? (esMessages as Record<string, unknown>)[namespace] || {} : esMessages;
    return (key: string, params?: Record<string, string | number>) => {
      const value = resolveNestedKey(messages as Record<string, unknown>, key);
      if (typeof value !== 'string') return key;
      if (!params) return value;
      return value.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`));
    };
  },
  useLocale: () => 'es',
  useMessages: () => esMessages,
  useNow: () => new Date(),
  useTimeZone: () => 'America/Bogota',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-intl/navigation to avoid ESM issues
jest.mock('next-intl/navigation', () => ({
  createNavigation: () => ({
    Link: ({ href, children, ...rest }: any) => React.createElement('a', { href, ...rest }, children),
    redirect: jest.fn(),
    usePathname: () => '/',
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    getPathname: jest.fn(),
  }),
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: any) => React.createElement('a', { href, ...rest }, children),
  redirect: jest.fn(),
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
  getPathname: jest.fn(),
}));

// Mock Swiper to avoid ESM parse errors
jest.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => React.createElement('div', { 'data-testid': 'swiper' }, children),
  SwiperSlide: ({ children }: any) => React.createElement('div', null, children),
}));
jest.mock('swiper/modules', () => ({ Navigation: {}, Pagination: {}, Autoplay: {} }));
jest.mock('swiper/css', () => {});
jest.mock('swiper/css/navigation', () => {});
jest.mock('swiper/css/pagination', () => {});
