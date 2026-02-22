import type { Schema, ValidationResult, ValidationError } from '../types.js';

type SchemaOutput<T> = T extends Schema<infer U> ? U : never;

type UnionOutput<T extends Schema<unknown>[]> = SchemaOutput<T[number]>;

export class UnionSchema<T extends Schema<unknown>[]> implements Schema<UnionOutput<T>> {
  private schemas: T;

  constructor(schemas: T) {
    this.schemas = schemas;
  }

  parse(input: unknown): ValidationResult<UnionOutput<T>> {
    const allErrors: ValidationError[] = [];

    for (const schema of this.schemas) {
      const result = schema.parse(input);
      if (result.success) {
        return { success: true, data: result.data as UnionOutput<T> };
      }
      allErrors.push(...result.errors);
    }

    return {
      success: false,
      errors: [{
        path: '',
        message: 'Value did not match any schema in union',
        expected: 'one of union types',
        received: typeof input
      }]
    };
  }
}

export function union<T extends Schema<unknown>[]>(schemas: T): UnionSchema<T> {
  return new UnionSchema(schemas);
}
