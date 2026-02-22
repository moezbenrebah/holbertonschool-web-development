import type { Schema, ValidationResult, ValidationError } from '../types.js';

type ObjectShape = Record<string, Schema<unknown>>;

type InferObjectShape<T extends ObjectShape> = {
  [K in keyof T]: T[K] extends Schema<infer U> ? U : never;
};

export class ObjectSchema<T extends ObjectShape> implements Schema<InferObjectShape<T>> {
  private shape: T;

  constructor(shape: T) {
    this.shape = shape;
  }

  private validateObjectType(input: unknown): ValidationError | null {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return {
        path: '',
        message: `Expected object, received ${input === null ? 'null' : Array.isArray(input) ? 'array' : typeof input}`,
        expected: 'object',
        received: input === null ? 'null' : Array.isArray(input) ? 'array' : typeof input
      };
    }
    return null;
  }

  private validateProperties(inputObj: Record<string, unknown>): ValidationResult<InferObjectShape<T>> {
    const result: Record<string, unknown> = {};
    const errors: ValidationError[] = [];

    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      if (!schema) continue;

      const value = inputObj[key];
      const parseResult = schema.parse(value);

      if (parseResult.success) {
        result[key] = parseResult.data;
      } else {
        for (const error of parseResult.errors) {
          errors.push({
            ...error,
            path: error.path ? `${key}.${error.path}` : key
          });
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: result as InferObjectShape<T> };
  }

  parse(input: unknown): ValidationResult<InferObjectShape<T>> {
    const typeError = this.validateObjectType(input);
    if (typeError !== null) {
      return { success: false, errors: [typeError] };
    }

    const inputObj = input as Record<string, unknown>;
    return this.validateProperties(inputObj);
  }
}

export function object<T extends ObjectShape>(shape: T): ObjectSchema<T> {
  return new ObjectSchema(shape);
}
