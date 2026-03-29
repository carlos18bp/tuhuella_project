/**
 * Contract Validation Utility
 *
 * Validates that mock data objects conform to the expected backend schema.
 * Use in E2E tests or as a standalone CI check to detect mock/backend drift.
 *
 * Usage:
 *   import { validateMock } from './contract-validate';
 *   import { favoriteSchema } from './contract-schemas';
 *
 *   const errors = validateMock(mockFavorite, favoriteSchema);
 *   expect(errors).toEqual([]); // No drift detected
 */

import type { SchemaDefinition } from './contract-schemas';

export interface ValidationError {
  schema: string;
  field: string;
  expected: string;
  actual: string;
}

/**
 * Validate a single mock object against a schema definition.
 * Returns an array of validation errors (empty = valid).
 */
export function validateMock(data: Record<string, unknown>, schema: SchemaDefinition): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for missing required fields
  for (const [field, spec] of Object.entries(schema.fields)) {
    if (spec.optional) continue;

    if (!(field in data)) {
      errors.push({
        schema: schema.name,
        field,
        expected: `field present (type: ${Array.isArray(spec.type) ? spec.type.join('|') : spec.type})`,
        actual: 'missing',
      });
      continue;
    }

    const value = data[field];

    // Null check
    if (value === null) {
      if (!spec.nullable) {
        errors.push({
          schema: schema.name,
          field,
          expected: `non-null ${Array.isArray(spec.type) ? spec.type.join('|') : spec.type}`,
          actual: 'null',
        });
      }
      continue;
    }

    // Type check
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    const expectedTypes = Array.isArray(spec.type) ? spec.type : [spec.type];

    if (!expectedTypes.includes(actualType as any)) {
      errors.push({
        schema: schema.name,
        field,
        expected: expectedTypes.join('|'),
        actual: actualType,
      });
    }
  }

  // Check for extra fields not in schema (potential drift or stale mock)
  for (const field of Object.keys(data)) {
    if (!(field in schema.fields)) {
      errors.push({
        schema: schema.name,
        field,
        expected: 'not present (field not in serializer)',
        actual: `extra field with type ${typeof data[field]}`,
      });
    }
  }

  return errors;
}

/**
 * Validate an array of mock objects against a schema.
 * Returns all errors across all items.
 */
export function validateMockArray(data: Record<string, unknown>[], schema: SchemaDefinition): ValidationError[] {
  return data.flatMap((item, index) =>
    validateMock(item, schema).map(err => ({
      ...err,
      field: `[${index}].${err.field}`,
    })),
  );
}

/**
 * Format validation errors into a readable string for test output.
 */
export function formatErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return 'No contract violations.';

  return errors
    .map(e => `  ${e.schema}.${e.field}: expected ${e.expected}, got ${e.actual}`)
    .join('\n');
}
