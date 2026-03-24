/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

function MockLink({ href, children, onClick, ...props }: any) {
  return React.createElement('a', { href, onClick, ...props }, children);
}

const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}));

const usePathname = jest.fn(() => '/');

const redirect = jest.fn();

const getPathname = jest.fn(({ href }: { href: string }) => href);

export { MockLink as Link, useRouter, usePathname, redirect, getPathname };
