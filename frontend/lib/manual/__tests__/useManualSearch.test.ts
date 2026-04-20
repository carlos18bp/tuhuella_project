import { renderHook } from '@testing-library/react';
import { BookOpen } from 'lucide-react';

import { useManualSearch } from '../useManualSearch';
import type { ManualSection } from '../types';

describe('useManualSearch', () => {
  it('returns empty results when the query is blank', () => {
    const { result } = renderHook(() => useManualSearch('', 'es'));
    expect(result.current.results).toHaveLength(0);
    expect(result.current.isSearching).toBe(false);
  });

  it('ranks matches in titles above matches in other fields', () => {
    const { result } = renderHook(() => useManualSearch('adopción', 'es'));
    expect(result.current.results.length).toBeGreaterThan(0);

    const top = result.current.results[0];
    expect(top.process.title.es.toLowerCase()).toContain('adopción');
  });

  it('finds a process whose keywords include a synonym', () => {
    const { result } = renderHook(() => useManualSearch('pasarela', 'es'));
    expect(result.current.results.length).toBeGreaterThan(0);
    expect(result.current.results[0].process.id).toMatch(/payment/);
  });

  it('exposes the owning section for a keyword-matched result', () => {
    const { result } = renderHook(() => useManualSearch('pasarela', 'es'));
    expect(result.current.results.length).toBeGreaterThan(0);
    expect(result.current.results[0].section.id).toBe('cross-cutting');
  });

  it('returns no matches for unknown terms', () => {
    const { result } = renderHook(() => useManualSearch('zxqvbnmplk', 'es'));
    expect(result.current.results).toHaveLength(0);
    expect(result.current.isSearching).toBe(true);
  });

  it('restricts search to the provided sections subset', () => {
    const customSections: ManualSection[] = [
      {
        id: 'custom',
        title: { es: 'Custom', en: 'Custom' },
        icon: BookOpen,
        audience: 'cross',
        processes: [
          {
            id: 'custom-only',
            audience: 'cross',
            title: { es: 'Proceso único personalizado', en: 'Custom only process' },
            summary: { es: 'resumen', en: 'summary' },
            why: { es: '', en: '' },
            steps: { es: ['paso uno'], en: ['step one'] },
            keywords: ['personalizado'],
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useManualSearch('personalizado', 'es', customSections),
    );
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].process.id).toBe('custom-only');
  });

  it('finds nothing when the query matches global content excluded by custom sections', () => {
    const emptySubset: ManualSection[] = [];
    const { result } = renderHook(() =>
      useManualSearch('adopción', 'es', emptySubset),
    );
    expect(result.current.results).toHaveLength(0);
  });
});
