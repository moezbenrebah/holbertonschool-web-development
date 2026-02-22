import type { Schema, ValidationResult } from '../types.js';

export class NumberSchema implements Schema<number> {
  private mustBePositive: boolean = false;
  private mustBeInteger: boolean = false;
  private minValue: number | undefined = undefined;
  private maxValue: number | undefined = undefined;

  parse(input: unknown): ValidationResult<number> {
    if (typeof input !== 'number' || Number.isNaN(input)) {
      return {
        success: false,
        errors: [{
          path: '',
          message: `Expected number, received ${typeof input}`,
          expected: 'number',
          received: typeof input
        }]
      };
    }

    const value = input;

    if (this.mustBePositive && value <= 0) {
      return {
        success: false,
        errors: [{
          path: '',
          message: 'Number must be positive',
          expected: 'positive number',
          received: `${value}`
        }]
      };
    }

    if (this.mustBeInteger && !Number.isInteger(value)) {
      return {
        success: false,
        errors: [{
          path: '',
          message: 'Number must be an integer',
          expected: 'integer',
          received: `${value}`
        }]
      };
    }

    if (this.minValue !== undefined && value < this.minValue) {
      return {
        success: false,
        errors: [{
          path: '',
          message: `Number must be at least ${this.minValue}`,
          expected: `number >= ${this.minValue}`,
          received: `${value}`
        }]
      };
    }

    if (this.maxValue !== undefined && value > this.maxValue) {
      return {
        success: false,
        errors: [{
          path: '',
          message: `Number must be at most ${this.maxValue}`,
          expected: `number <= ${this.maxValue}`,
          received: `${value}`
        }]
      };
    }

    return { success: true, data: value };
  }

  positive(): NumberSchema {
    this.mustBePositive = true;
    return this;
  }

  int(): NumberSchema {
    this.mustBeInteger = true;
    return this;
  }

  min(value: number): NumberSchema {
    this.minValue = value;
    return this;
  }

  max(value: number): NumberSchema {
    this.maxValue = value;
    return this;
  }

  optional(): any {
    return this;
  }
}

export function number(): NumberSchema {
  return new NumberSchema();
}
