import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Sidebar from '../Sidebar';

let mockPathname = '/refugio/dashboard';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const shelterItems = [
  { label: 'Dashboard', href: '/refugio/dashboard' },
  { label: 'Animales', href: '/refugio/animales' },
  { label: 'Solicitudes', href: '/refugio/solicitudes' },
];

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/refugio/dashboard';
  });

  it('renders all navigation items in desktop sidebar', () => {
    render(<Sidebar title="Refugio" items={shelterItems} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(shelterItems.length);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/refugio/dashboard');
    expect(screen.getByRole('link', { name: 'Animales' })).toHaveAttribute('href', '/refugio/animales');
    expect(screen.getByRole('link', { name: 'Solicitudes' })).toHaveAttribute('href', '/refugio/solicitudes');
  });

  it('renders the sidebar title in the desktop heading', () => {
    render(<Sidebar title="Refugio" items={shelterItems} />);
    const headings = screen.getAllByText('Refugio');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('marks the current page link with aria-current', () => {
    render(<Sidebar title="Refugio" items={shelterItems} />);
    const activeLinks = screen.getAllByRole('link', { name: 'Dashboard' });
    const hasAriaCurrent = activeLinks.some((link) => link.getAttribute('aria-current') === 'page');
    expect(hasAriaCurrent).toBe(true);
  });

  it('does not mark non-active links with aria-current', () => {
    render(<Sidebar title="Refugio" items={shelterItems} />);
    const animalesLinks = screen.getAllByRole('link', { name: 'Animales' });
    animalesLinks.forEach((link) => {
      expect(link).not.toHaveAttribute('aria-current');
    });
  });

  it('renders mobile toggle button', () => {
    render(<Sidebar title="Refugio" items={shelterItems} />);
    expect(screen.getByRole('button', { name: 'Toggle sidebar' })).toBeInTheDocument();
  });

  it('opens mobile menu when toggle button is clicked', async () => {
    render(<Sidebar title="Refugio" items={shelterItems} />);
    const toggle = screen.getByRole('button', { name: 'Toggle sidebar' });

    await userEvent.click(toggle);

    const allLinks = screen.getAllByRole('link', { name: 'Dashboard' });
    expect(allLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('closes mobile menu when a nav link is clicked', async () => {
    render(<Sidebar title="Refugio" items={shelterItems} />);
    const toggle = screen.getByRole('button', { name: 'Toggle sidebar' });

    await userEvent.click(toggle);
    const mobileLinks = screen.getAllByRole('link', { name: 'Animales' });
    await userEvent.click(mobileLinks[mobileLinks.length - 1]);

    const remainingLinks = screen.getAllByRole('link', { name: 'Animales' });
    expect(remainingLinks).toHaveLength(1);
  });

  it('renders with amber accent color', () => {
    render(<Sidebar title="Admin" items={shelterItems} accentColor="amber" />);
    expect(screen.getByRole('button', { name: 'Toggle sidebar' })).toBeInTheDocument();
  });

  it('renders navigation with correct aria-label', () => {
    render(<Sidebar title="Refugio" items={shelterItems} />);
    const navs = screen.getAllByRole('navigation', { name: 'Refugio' });
    expect(navs.length).toBeGreaterThanOrEqual(1);
  });

  it('highlights the correct active item when pathname changes', () => {
    mockPathname = '/refugio/animales';
    render(<Sidebar title="Refugio" items={shelterItems} />);
    const animalesLinks = screen.getAllByRole('link', { name: 'Animales' });
    const hasAriaCurrent = animalesLinks.some((link) => link.getAttribute('aria-current') === 'page');
    expect(hasAriaCurrent).toBe(true);
  });
});
