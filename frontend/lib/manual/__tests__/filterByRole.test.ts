import { canViewManualAudience, filterManualSectionsForRole } from '../filterByRole';
import type { ManualAudience, ManualSection } from '../types';
import type { UserRole } from '@/lib/types';
import { BookOpen } from 'lucide-react';

const makeSection = (
  id: string,
  audiences: ManualAudience[],
): ManualSection => ({
  id,
  title: { es: id, en: id },
  icon: BookOpen,
  audience: audiences[0],
  processes: audiences.map((audience, i) => ({
    id: `${id}-${i}`,
    audience,
    title: { es: `${id}-${i}`, en: `${id}-${i}` },
    summary: { es: '', en: '' },
    why: { es: '', en: '' },
    steps: { es: [], en: [] },
    keywords: [],
  })),
});

describe('canViewManualAudience', () => {
  describe('unauthenticated (role null)', () => {
    it.each(['public', 'cross'] as ManualAudience[])(
      'allows %s audience',
      (audience) => {
        expect(canViewManualAudience(null, audience)).toBe(true);
      },
    );

    it.each(['adopter', 'shelter_admin', 'veterinarian', 'web_manager', 'admin'] as ManualAudience[])(
      'blocks %s audience',
      (audience) => {
        expect(canViewManualAudience(null, audience)).toBe(false);
      },
    );
  });

  describe('web_manager and admin see everything', () => {
    const ALL_AUDIENCES: ManualAudience[] = [
      'public', 'cross', 'adopter', 'shelter_admin', 'veterinarian', 'web_manager', 'admin',
    ];
    it.each(
      (['web_manager', 'admin'] as UserRole[]).flatMap(
        (role) => ALL_AUDIENCES.map((audience) => [role, audience] as [UserRole, ManualAudience]),
      ),
    )('%s can view %s audience', (role, audience) => {
      expect(canViewManualAudience(role, audience)).toBe(true);
    });
  });

  describe('adopter role', () => {
    it('can view adopter audience', () => {
      expect(canViewManualAudience('adopter', 'adopter')).toBe(true);
    });

    it('can view cross audience', () => {
      expect(canViewManualAudience('adopter', 'cross')).toBe(true);
    });

    it('can view public audience', () => {
      expect(canViewManualAudience('adopter', 'public')).toBe(true);
    });

    it('cannot view shelter_admin audience', () => {
      expect(canViewManualAudience('adopter', 'shelter_admin')).toBe(false);
    });

    it('cannot view veterinarian audience', () => {
      expect(canViewManualAudience('adopter', 'veterinarian')).toBe(false);
    });
  });

  describe('each non-privileged role sees only its own + cross + public', () => {
    it.each([
      ['shelter_admin', 'adopter'],
      ['shelter_admin', 'veterinarian'],
      ['veterinarian', 'adopter'],
      ['veterinarian', 'shelter_admin'],
    ] as [UserRole, ManualAudience][])(
      '%s cannot view %s audience',
      (role, audience) => {
        expect(canViewManualAudience(role, audience)).toBe(false);
      },
    );
  });
});

describe('filterManualSectionsForRole', () => {
  const sections = [
    makeSection('a', ['adopter', 'cross']),
    makeSection('b', ['shelter_admin']),
    makeSection('c', ['veterinarian', 'public']),
    makeSection('d', ['cross']),
  ];

  it('returns all sections unchanged for web_manager', () => {
    const result = filterManualSectionsForRole(sections, 'web_manager');
    expect(result).toBe(sections);
  });

  it('returns all sections unchanged for admin', () => {
    const result = filterManualSectionsForRole(sections, 'admin');
    expect(result).toBe(sections);
  });

  it('filters adopter to adopter+cross+public processes only', () => {
    const result = filterManualSectionsForRole(sections, 'adopter');
    const ids = result.map((s) => s.id);
    expect(ids).toContain('a');
    expect(ids).not.toContain('b');
    expect(ids).toContain('d');
  });

  it('excludes sections where all processes are invisible', () => {
    const result = filterManualSectionsForRole(sections, 'adopter');
    expect(result.find((s) => s.id === 'b')).toBeUndefined();
  });

  it('filters processes within a returned section', () => {
    const mixed = [makeSection('mixed', ['adopter', 'shelter_admin', 'cross'])];
    const result = filterManualSectionsForRole(mixed, 'adopter');
    expect(result).toHaveLength(1);
    expect(result[0].processes).toHaveLength(2);
    expect(result[0].processes.map((p) => p.audience)).toEqual(
      expect.arrayContaining(['adopter', 'cross']),
    );
  });

  it('returns empty array when no sections match the role', () => {
    const onlyAdmin = [makeSection('x', ['admin'])];
    const result = filterManualSectionsForRole(onlyAdmin, 'adopter');
    expect(result).toHaveLength(0);
  });

  it('returns a new array (not the same reference) for restricted roles', () => {
    const result = filterManualSectionsForRole(sections, 'adopter');
    expect(result).not.toBe(sections);
  });
});
