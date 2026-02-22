import type { Schema, ValidationResult } from '../types.js';

export class StringSchema implements Schema<string> {
  private minLength: number | undefined = undefined;
  private maxLength: number | undefined = undefined;

  parse(input: unknown): ValidationResult<string> {
    if (typeof input !== 'string') {
      return {
        success: false,
        errors: [{
          path: '',
          message: `Expected string, received ${typeof input}`,
          expected: 'string',
          received: typeof input
        }]
      };
    }

    const value = input;

    if (this.minLength !== undefined && value.length < this.minLength) {
      return {
        success: false,
        errors: [{
          path: '',
          message: `String must be at least ${this.minLength} characters`,
          expected: `string with min length ${this.minLength}`,
          received: `string with length ${value.length}`
        }]
      };
    }

    if (this.maxLength !== undefined && value.length > this.maxLength) {
      return {
        success: false,
        errors: [{
          path: '',
          message: `String must be at most ${this.maxLength} characters`,
          expected: `string with max length ${this.maxLength}`,
          received: `string with length ${value.length}`
        }]
      };
    }

    return { success: true, data: value };
  }

  min(length: number): StringSchema {
    this.minLength = length;
    return this;
  }

  max(length: number): StringSchema {
    this.maxLength = length;
    return this;
  }

  optional(): any {
    return this;
  }
}

export function string(): StringSchema {
  return new StringSchema();
}
