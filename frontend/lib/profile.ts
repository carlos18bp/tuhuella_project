import type { ProfileStats, UserRole } from '@/lib/types';

type CompletenessUser = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
};

export function calcCompleteness(
  user: CompletenessUser,
  role: UserRole,
  stats?: ProfileStats | null,
): number {
  let score = 0;
  if (user.first_name && user.last_name) score += role === 'adopter' ? 15 : 30;
  if (user.email) score += role === 'adopter' ? 15 : 30;
  if (user.phone) score += role === 'adopter' ? 20 : 40;
  if (role !== 'adopter') return score;
  if (user.city) score += 20;
  if (stats?.adopter_intent) score += 30;
  return score;
}

export function getUserInitials(user: { first_name?: string; last_name?: string }): string {
  return [user.first_name?.[0], user.last_name?.[0]].filter(Boolean).join('').toUpperCase();
}

export function formatMemberSince(dateJoined: string | undefined, locale = 'es-CO'): string {
  if (!dateJoined) return '';
  return new Date(dateJoined).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}
