import type { Schema, ValidationResult, ValidationError } from '../types.js';

export class ArraySchema<T> implements Schema<T[]> {
  private elementSchema: Schema<T>;
  private minLength: number | undefined = undefined;
  private maxLength: number | undefined = undefined;

  constructor(elementSchema: Schema<T>) {
    this.elementSchema = elementSchema;
  }

  private validateArrayType(input: unknown): ValidationError | null {
    if (!Array.isArray(input)) {
      return {
        path: '',
        message: `Expected array, received ${typeof input}`,
        expected: 'array',
        received: typeof input
      };
    }
    return null;
  }

  private validateLength(input: unknown[]): ValidationError | null {
    if (this.minLength !== undefined && input.length < this.minLength) {
      return {
        path: '',
        message: `Array must have at least ${this.minLength} elements`,
        expected: `array with min length ${this.minLength}`,
        received: `array with length ${input.length}`
      };
    }

    if (this.maxLength !== undefined && input.length > this.maxLength) {
      return {
        path: '',
        message: `Array must have at most ${this.maxLength} elements`,
        expected: `array with max length ${this.maxLength}`,
        received: `array with length ${input.length}`
      };
    }

    return null;
  }

  private validateElements(input: unknown[]): ValidationResult<T[]> {
    const result: T[] = [];
    const errors: ValidationError[] = [];

    for (let i = 0; i < input.length; i++) {
      const element = input[i];
      const parseResult = this.elementSchema.parse(element);

      if (parseResult.success) {
        result.push(parseResult.data);
      } else {
        for (const error of parseResult.errors) {
          errors.push({
            ...error,
            path: error.path ? `[${i}].${error.path}` : `[${i}]`
          });
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: result };
  }

  parse(input: unknown): ValidationResult<T[]> {
    const typeError = this.validateArrayType(input);
    if (typeError !== null) {
      return { success: false, errors: [typeError] };
    }

    const inputArray = input as unknown[];

    const lengthError = this.validateLength(inputArray);
    if (lengthError !== null) {
      return { success: false, errors: [lengthError] };
    }

    return this.validateElements(inputArray);
  }

  min(length: number): ArraySchema<T> {
    this.minLength = length;
    return this;
  }

  max(length: number): ArraySchema<T> {
    this.maxLength = length;
    return this;
  }

  optional(): any {
    return this;
  }
}

export function array<T>(elementSchema: Schema<T>): ArraySchema<T> {
  return new ArraySchema(elementSchema);
}
