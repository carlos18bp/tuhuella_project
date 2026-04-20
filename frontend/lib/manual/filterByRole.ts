import type { UserRole } from '@/lib/types';
import type { ManualAudience, ManualSection } from './types';

const SEES_EVERYTHING: UserRole[] = ['web_manager', 'admin'];

export function canViewManualAudience(
  role: UserRole | null | undefined,
  audience: ManualAudience,
): boolean {
  if (!role) {
    return audience === 'public' || audience === 'cross';
  }
  if (SEES_EVERYTHING.includes(role)) return true;
  if (audience === 'cross' || audience === 'public') return true;
  return audience === role;
}

export function filterManualSectionsForRole(
  sections: ManualSection[],
  role: UserRole | null | undefined,
): ManualSection[] {
  if (role && SEES_EVERYTHING.includes(role)) return sections;

  const filtered: ManualSection[] = [];
  for (const section of sections) {
    const processes = section.processes.filter((p) =>
      canViewManualAudience(role, p.audience),
    );
    if (processes.length === 0) continue;
    filtered.push({ ...section, processes });
  }
  return filtered;
}
