import { renderHook } from '@testing-library/react';

import { useManualSearch } from '../useManualSearch';

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
    const { result } = renderHook(() => useManualSearch('wompi', 'es'));
    expect(result.current.results.length).toBeGreaterThan(0);
    expect(result.current.results[0].process.id).toMatch(/payment/);
  });

  it('exposes the owning section for a keyword-matched result', () => {
    const { result } = renderHook(() => useManualSearch('wompi', 'es'));
    expect(result.current.results.length).toBeGreaterThan(0);
    expect(result.current.results[0].section.id).toBe('cross-cutting');
  });

  it('returns no matches for unknown terms', () => {
    const { result } = renderHook(() => useManualSearch('zxqvbnmplk', 'es'));
    expect(result.current.results).toHaveLength(0);
    expect(result.current.isSearching).toBe(true);
  });
});
