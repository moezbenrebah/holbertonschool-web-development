import type { Schema, ValidationResult } from '../types.js';

type Primitive = string | number | boolean | null | undefined;

export class LiteralSchema<T extends Primitive> implements Schema<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  parse(input: unknown): ValidationResult<T> {
    if (input !== this.value) {
      return {
        success: false,
        errors: [{
          path: '',
          message: `Expected ${JSON.stringify(this.value)}, received ${JSON.stringify(input)}`,
          expected: JSON.stringify(this.value),
          received: JSON.stringify(input)
        }]
      };
    }

    return { success: true, data: input as T };
  }
}

export function literal<T extends Primitive>(value: T): LiteralSchema<T> {
  return new LiteralSchema(value);
}
