import { canOpenEcosystemView, findEcosystemNode } from '../ecosystem';
import type { UserRole } from '@/lib/types';

describe('ecosystem screen access', () => {
  it.each(['adopter', 'shelter_admin', 'veterinarian', 'web_manager', 'admin'] as UserRole[])('allows %s to open the map', (role) => {
    expect(canOpenEcosystemView(findEcosystemNode('ecosystem').view!, { role, is_staff: false })).toBe(true);
  });

  it.each(['adopter', 'shelter_admin', 'veterinarian', 'web_manager'] as UserRole[])('withholds the administration entry for non-staff %s', (role) => {
    expect(canOpenEcosystemView(findEcosystemNode('admin-metrics').view!, { role, is_staff: false })).toBe(false);
  });

  it('preserves staff access to administrative pages', () => {
    expect(canOpenEcosystemView(findEcosystemNode('admin-metrics').view!, { role: 'web_manager', is_staff: true })).toBe(true);
  });

  it('withholds shelter management from an adopter', () => {
    expect(canOpenEcosystemView(findEcosystemNode('shelter-animals').view!, { role: 'adopter', is_staff: false })).toBe(false);
  });

  it.each(['adopter', 'shelter_admin'] as UserRole[])('allows %s to review the shelter application', (role) => {
    expect(canOpenEcosystemView(findEcosystemNode('shelter-application').view!, { role, is_staff: false })).toBe(true);
  });

  it('withholds the shelter application from unrelated staff', () => {
    expect(canOpenEcosystemView(findEcosystemNode('shelter-application').view!, { role: 'web_manager', is_staff: true })).toBe(false);
  });

  it('withholds private links while the user loads', () => {
    expect(canOpenEcosystemView(findEcosystemNode('applications').view!, null)).toBe(false);
  });

  it('keeps public discovery accessible', () => {
    expect(canOpenEcosystemView(findEcosystemNode('animals').view!, null)).toBe(true);
  });

  it('never offers the token handoff as a direct link', () => {
    expect(canOpenEcosystemView(findEcosystemNode('admin-login').view!, { role: 'admin', is_staff: true })).toBe(false);
  });
});
