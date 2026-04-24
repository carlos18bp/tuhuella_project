import { describe, it, expect } from '@jest/globals';

import { canAccessStaffArea } from '../permissions';

describe('canAccessStaffArea', () => {
  it('returns false for null user', () => {
    expect(canAccessStaffArea(null)).toBe(false);
  });

  it('returns false for undefined user', () => {
    expect(canAccessStaffArea(undefined)).toBe(false);
  });

  it('returns true for web_manager role', () => {
    expect(canAccessStaffArea({ role: 'web_manager', is_staff: false })).toBe(true);
  });

  it('returns true for admin role', () => {
    expect(canAccessStaffArea({ role: 'admin', is_staff: false })).toBe(true);
  });

  it('returns true for is_staff even with non-staff role', () => {
    expect(canAccessStaffArea({ role: 'adopter', is_staff: true })).toBe(true);
  });

  it('returns false for non-staff role without is_staff', () => {
    expect(canAccessStaffArea({ role: 'adopter', is_staff: false })).toBe(false);
  });

  it('returns false for shelter_admin without is_staff', () => {
    expect(canAccessStaffArea({ role: 'shelter_admin', is_staff: false })).toBe(false);
  });
});
