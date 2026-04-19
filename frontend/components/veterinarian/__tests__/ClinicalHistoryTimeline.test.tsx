import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import ClinicalHistoryTimeline from '../ClinicalHistoryTimeline';
import type { ClinicalHistoryEntry } from '@/lib/types';

const makeEntry = (overrides: Partial<ClinicalHistoryEntry> = {}): ClinicalHistoryEntry => ({
  id: 1,
  animal: 1,
  author: 1,
  entry_type: 'checkup',
  title: 'Revisión general',
  body_es: 'Sin novedad en español',
  body_en: 'No issues in English',
  occurred_at: '2026-04-19T10:00:00Z',
  attachment_urls: [],
  created_at: '2026-04-19T10:05:00Z',
  ...overrides,
});

describe('ClinicalHistoryTimeline', () => {
  it('renders empty-state copy when there are no entries', () => {
    render(<ClinicalHistoryTimeline entries={[]} />);
    expect(screen.getByText('No hay entradas clínicas registradas.')).toBeInTheDocument();
  });

  it('renders body_es by default because locale is mocked to es', () => {
    render(<ClinicalHistoryTimeline entries={[makeEntry()]} />);
    expect(screen.getByText('Sin novedad en español')).toBeInTheDocument();
    expect(screen.queryByText('No issues in English')).toBeNull();
  });

  it('falls back to body_en when body_es is empty', () => {
    render(<ClinicalHistoryTimeline entries={[makeEntry({ body_es: '' })]} />);
    expect(screen.getByText('No issues in English')).toBeInTheDocument();
  });

  it('renders the entry title and translated entry type', () => {
    render(
      <ClinicalHistoryTimeline
        entries={[makeEntry({ title: 'Vacunación anual', entry_type: 'vaccination' })]}
      />,
    );
    expect(screen.getByText('Vacunación anual')).toBeInTheDocument();
    expect(screen.getByText('Vacunación')).toBeInTheDocument();
  });
});
