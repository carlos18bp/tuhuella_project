import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookOpen, Heart } from 'lucide-react';

import ManualSidebar from '../ManualSidebar';
import type { ManualSection } from '@/lib/manual/types';

const buildSection = (overrides: Partial<ManualSection> = {}): ManualSection => ({
  id: 'intro',
  title: { es: 'Introducción', en: 'Introduction' },
  icon: BookOpen,
  audience: 'public',
  processes: [
    {
      id: 'welcome',
      audience: 'public',
      title: { es: 'Bienvenida', en: 'Welcome' },
      summary: { es: '', en: '' },
      why: { es: '', en: '' },
      steps: { es: [], en: [] },
      keywords: [],
    },
  ],
  ...overrides,
});

describe('ManualSidebar', () => {
  it('renders section titles in the active locale', () => {
    render(<ManualSidebar sections={[buildSection()]} locale="es" />);
    expect(screen.getAllByRole('button', { name: /Introducción/i }).length).toBeGreaterThan(0);
  });

  it('renders section titles in english when locale is en', () => {
    render(<ManualSidebar sections={[buildSection()]} locale="en" />);
    expect(screen.getAllByRole('button', { name: /Introduction/i }).length).toBeGreaterThan(0);
  });

  it('renders process links inside their section', () => {
    render(<ManualSidebar sections={[buildSection()]} locale="es" />);
    expect(screen.getAllByRole('link', { name: 'Bienvenida' }).length).toBeGreaterThan(0);
  });

  it('collapses section processes when section toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<ManualSidebar sections={[buildSection()]} locale="es" />);

    const [toggle] = screen.getAllByRole('button', { name: /Introducción/i });
    await user.click(toggle);

    expect(screen.queryByRole('link', { name: 'Bienvenida' })).not.toBeInTheDocument();
  });

  it('expands a collapsed section when toggled twice', async () => {
    const user = userEvent.setup();
    render(<ManualSidebar sections={[buildSection()]} locale="es" />);

    const [toggle] = screen.getAllByRole('button', { name: /Introducción/i });
    await user.click(toggle);
    await user.click(toggle);

    expect(screen.getAllByRole('link', { name: 'Bienvenida' }).length).toBeGreaterThan(0);
  });

  it('applies highlight styles for highlighted sections', () => {
    render(
      <ManualSidebar
        sections={[buildSection({ highlight: true, title: { es: 'Destacada', en: 'Featured' } })]}
        locale="es"
      />,
    );
    const [toggle] = screen.getAllByRole('button', { name: /Destacada/i });
    expect(toggle.className).toContain('text-amber-800');
  });

  it('opens the mobile panel when the mobile menu button is clicked', async () => {
    const user = userEvent.setup();
    render(<ManualSidebar sections={[buildSection()]} locale="es" />);

    const mobileButton = screen.getAllByRole('button').find((b) => b.getAttribute('aria-expanded') !== null && !b.getAttribute('aria-controls'));
    expect(mobileButton).toBeDefined();
    await user.click(mobileButton!);

    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(1);
  });

  it('closes the mobile panel when a process link is clicked', async () => {
    const user = userEvent.setup();
    render(<ManualSidebar sections={[buildSection()]} locale="es" />);

    const mobileButton = screen.getAllByRole('button').find((b) => b.getAttribute('aria-expanded') !== null && !b.getAttribute('aria-controls'));
    await user.click(mobileButton!);

    const navs = screen.getAllByRole('navigation');
    const mobileNav = navs[0];
    const link = within(mobileNav).getAllByRole('link', { name: 'Bienvenida' })[0];
    await user.click(link);

    expect(screen.getAllByRole('navigation').length).toBe(1);
  });

  it('renders multiple sections independently', () => {
    const other = buildSection({
      id: 'advanced',
      title: { es: 'Avanzado', en: 'Advanced' },
      icon: Heart,
      processes: [
        {
          id: 'howto',
          audience: 'public',
          title: { es: 'Cómo hacer', en: 'How to' },
          summary: { es: '', en: '' },
          why: { es: '', en: '' },
          steps: { es: [], en: [] },
          keywords: [],
        },
      ],
    });

    render(<ManualSidebar sections={[buildSection(), other]} locale="es" />);
    expect(screen.getAllByRole('button', { name: /Avanzado/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Cómo hacer' }).length).toBeGreaterThan(0);
  });

  it('toggles only the clicked section, not others', async () => {
    const user = userEvent.setup();
    const other = buildSection({
      id: 'advanced',
      title: { es: 'Avanzado', en: 'Advanced' },
      icon: Heart,
      processes: [
        {
          id: 'howto',
          audience: 'public',
          title: { es: 'Cómo hacer', en: 'How to' },
          summary: { es: '', en: '' },
          why: { es: '', en: '' },
          steps: { es: [], en: [] },
          keywords: [],
        },
      ],
    });

    render(<ManualSidebar sections={[buildSection(), other]} locale="es" />);
    const [introToggle] = screen.getAllByRole('button', { name: /Introducción/i });
    await user.click(introToggle);

    expect(screen.queryByRole('link', { name: 'Bienvenida' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Cómo hacer' }).length).toBeGreaterThan(0);
  });
});
