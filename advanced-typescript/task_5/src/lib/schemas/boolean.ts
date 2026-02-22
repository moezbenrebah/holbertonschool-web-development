import type { Schema, ValidationResult } from '../types.js';

export class BooleanSchema implements Schema<boolean> {
  parse(input: unknown): ValidationResult<boolean> {
    if (typeof input !== 'boolean') {
      return {
        success: false,
        errors: [{
          path: '',
          message: `Expected boolean, received ${typeof input}`,
          expected: 'boolean',
          received: typeof input
        }]
      };
    }

    return { success: true, data: input };
  }

  optional(): any {
    return this;
  }
}

export function boolean(): BooleanSchema {
  return new BooleanSchema();
}
