import { describe, it, expect } from '@jest/globals';

import { calcCompleteness, getUserInitials, formatMemberSince } from '../profile';

describe('calcCompleteness', () => {
  const fullUser = {
    first_name: 'Ana',
    last_name: 'García',
    email: 'ana@example.com',
    phone: '3001234567',
    city: 'Bogotá',
  };

  it('returns 100 for adopter with all fields and adopter_intent stat', () => {
    const score = calcCompleteness(fullUser, 'adopter', { adopter_intent: 'cat' } as never);
    expect(score).toBe(100);
  });

  it('returns 0 for adopter with no fields filled', () => {
    const score = calcCompleteness(
      { first_name: '', last_name: '', email: '', phone: '', city: '' },
      'adopter',
    );
    expect(score).toBe(0);
  });

  it('returns partial score for adopter missing phone, city and stats', () => {
    const score = calcCompleteness(
      { first_name: 'Ana', last_name: 'García', email: 'ana@example.com', phone: '', city: '' },
      'adopter',
    );
    expect(score).toBe(30);
  });

  it('returns 100 for non-adopter role with all base fields', () => {
    const score = calcCompleteness(fullUser, 'shelter_admin' as never);
    expect(score).toBe(100);
  });

  it('returns 0 for non-adopter with no fields filled', () => {
    const score = calcCompleteness(
      { first_name: '', last_name: '', email: '', phone: '', city: '' },
      'veterinarian' as never,
    );
    expect(score).toBe(0);
  });

  it('ignores city and stats for non-adopter roles', () => {
    const scoreWithCity = calcCompleteness(
      { first_name: '', last_name: '', email: '', phone: '', city: 'Medellín' },
      'shelter_admin' as never,
    );
    expect(scoreWithCity).toBe(0);
  });
});

describe('getUserInitials', () => {
  it('returns uppercased initials from first and last name', () => {
    expect(getUserInitials({ first_name: 'ana', last_name: 'garcía' })).toBe('AG');
  });

  it('returns single initial when only first name is provided', () => {
    expect(getUserInitials({ first_name: 'Carlos' })).toBe('C');
  });

  it('returns empty string when both names are absent', () => {
    expect(getUserInitials({})).toBe('');
  });

  it('returns single initial when only last name is provided', () => {
    expect(getUserInitials({ last_name: 'López' })).toBe('L');
  });
});

describe('formatMemberSince', () => {
  it('formats a valid ISO date string to a localised month and year', () => {
    const result = formatMemberSince('2024-03-15T00:00:00Z', 'es-CO');
    expect(result).toContain('2024');
  });

  it('returns empty string when dateJoined is undefined', () => {
    expect(formatMemberSince(undefined)).toBe('');
  });
});
