export interface ValidationError {
  path: string;
  message: string;
  expected: string;
  received: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

export interface Schema<T> {
  parse(input: unknown): ValidationResult<T>;
}

export type Infer<T extends Schema<unknown>> = T extends Schema<infer U> ? U : never;
