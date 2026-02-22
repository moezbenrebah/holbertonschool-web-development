import type { Schema, ValidationResult } from '../types.js';

export interface ClientConfig {
  baseUrl: string;
}

export class ValidationError extends Error {
  public errors: { path: string; message: string }[];

  constructor(errors: { path: string; message: string }[]) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class HttpClient {
  private baseUrl: string;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl;
  }

  async get<T>(url: string, schema: Schema<T>): Promise<T> {
    const response = await fetch(this.baseUrl + url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const json: unknown = await response.json();
    const result: ValidationResult<T> = schema.parse(json);

    if (!result.success) {
      throw new ValidationError(result.errors);
    }

    return result.data;
  }

  async post<T>(url: string, body: unknown, schema: Schema<T>): Promise<T> {
    const response = await fetch(this.baseUrl + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const json: unknown = await response.json();
    const result: ValidationResult<T> = schema.parse(json);

    if (!result.success) {
      throw new ValidationError(result.errors);
    }

    return result.data;
  }

  async put<T>(url: string, body: unknown, schema: Schema<T>): Promise<T> {
    const response = await fetch(this.baseUrl + url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const json: unknown = await response.json();
    const result: ValidationResult<T> = schema.parse(json);

    if (!result.success) {
      throw new ValidationError(result.errors);
    }

    return result.data;
  }

  async delete<T>(url: string, schema: Schema<T>): Promise<T> {
    const response = await fetch(this.baseUrl + url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const json: unknown = await response.json();
    const result: ValidationResult<T> = schema.parse(json);

    if (!result.success) {
      throw new ValidationError(result.errors);
    }

    return result.data;
  }
}

export function createClient(config: ClientConfig): HttpClient {
  return new HttpClient(config);
}
