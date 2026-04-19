import type { UserRole } from '@/lib/types';

type AuthUserLike = { role: UserRole; is_staff: boolean } | null | undefined;

const STAFF_AREA_ROLES: UserRole[] = ['web_manager', 'admin'];

export function canAccessStaffArea(user: AuthUserLike): boolean {
  if (!user) return false;
  return STAFF_AREA_ROLES.includes(user.role) || user.is_staff;
}
