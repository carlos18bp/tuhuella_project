import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import AdminApplicationsTable from '../AdminApplicationsTable';
import type { AdoptionApplication } from '@/lib/types';

const buildApp = (overrides: Partial<AdoptionApplication> = {}): AdoptionApplication => ({
  id: 1,
  animal: 10,
  animal_name: 'Firulais',
  shelter_name: 'Happy Paws',
  user: 7,
  user_email: 'ana@example.com',
  status: 'submitted',
  form_answers: {},
  notes: '',
  created_at: '2026-04-10T10:00:00Z',
  updated_at: '2026-04-10T10:00:00Z',
  ...(overrides as AdoptionApplication),
});

describe('AdminApplicationsTable', () => {
  it('shows loading state when loading is true', () => {
    render(<AdminApplicationsTable items={[]} loading />);
    expect(screen.getByRole('status', { name: 'loading' })).toBeInTheDocument();
  });

  it('shows empty state when items is empty and not loading', () => {
    render(<AdminApplicationsTable items={[]} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders a table row per application', () => {
    render(<AdminApplicationsTable items={[buildApp(), buildApp({ id: 2, animal_name: 'Luna' })]} />);
    expect(screen.getByRole('cell', { name: 'Firulais' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Luna' })).toBeInTheDocument();
  });

  it('renders applicant email', () => {
    render(<AdminApplicationsTable items={[buildApp()]} />);
    expect(screen.getByRole('cell', { name: 'ana@example.com' })).toBeInTheDocument();
  });

  it('renders shelter column by default', () => {
    render(<AdminApplicationsTable items={[buildApp()]} />);
    expect(screen.getByRole('cell', { name: 'Happy Paws' })).toBeInTheDocument();
  });

  it('hides shelter column when showShelter is false', () => {
    render(<AdminApplicationsTable items={[buildApp()]} showShelter={false} />);
    expect(screen.queryByRole('cell', { name: 'Happy Paws' })).not.toBeInTheDocument();
  });

  it('shows em-dash when shelter_name is null', () => {
    render(<AdminApplicationsTable items={[buildApp({ shelter_name: null as never })]} />);
    expect(screen.getByRole('cell', { name: '—' })).toBeInTheDocument();
  });

  it('applies submitted status badge style', () => {
    render(<AdminApplicationsTable items={[buildApp({ status: 'submitted' })]} />);
    // quality: disable fragile_locator (CSS class assertion requires DOM access; span has no ARIA role)
    const badge = screen.getByRole('row', { name: /Firulais/ }).querySelector('span.rounded-full');
    expect(badge?.className).toContain('bg-amber-50');
  });

  it('applies approved status badge style', () => {
    render(<AdminApplicationsTable items={[buildApp({ status: 'approved' })]} />);
    // quality: disable fragile_locator (CSS class assertion requires DOM access; span has no ARIA role)
    const badge = screen.getByRole('row', { name: /Firulais/ }).querySelector('span.rounded-full');
    expect(badge?.className).toContain('bg-emerald-50');
  });

  it('applies rejected status badge style', () => {
    render(<AdminApplicationsTable items={[buildApp({ status: 'rejected' })]} />);
    // quality: disable fragile_locator (CSS class assertion requires DOM access; span has no ARIA role)
    const badge = screen.getByRole('row', { name: /Firulais/ }).querySelector('span.rounded-full');
    expect(badge?.className).toContain('bg-red-50');
  });

  it('applies reviewing status badge style', () => {
    render(<AdminApplicationsTable items={[buildApp({ status: 'reviewing' })]} />);
    // quality: disable fragile_locator (CSS class assertion requires DOM access; span has no ARIA role)
    const badge = screen.getByRole('row', { name: /Firulais/ }).querySelector('span.rounded-full');
    expect(badge?.className).toContain('bg-sky-50');
  });

  it('applies interview status badge style', () => {
    render(<AdminApplicationsTable items={[buildApp({ status: 'interview' })]} />);
    // quality: disable fragile_locator (CSS class assertion requires DOM access; span has no ARIA role)
    const badge = screen.getByRole('row', { name: /Firulais/ }).querySelector('span.rounded-full');
    expect(badge?.className).toContain('bg-indigo-50');
  });

  it('formats created_at as a locale date string', () => {
    render(<AdminApplicationsTable items={[buildApp({ created_at: '2026-04-10T10:00:00Z' })]} />);
    const expected = new Date('2026-04-10T10:00:00Z').toLocaleDateString();
    expect(screen.getByRole('cell', { name: expected })).toBeInTheDocument();
  });

  it('omits the shelter header when showShelter is false', () => {
    render(<AdminApplicationsTable items={[buildApp()]} showShelter={false} />);
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent);
    expect(headers).toHaveLength(4);
  });
});
