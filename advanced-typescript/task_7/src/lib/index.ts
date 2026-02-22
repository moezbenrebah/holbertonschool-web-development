export type { Schema, ValidationResult, ValidationError } from './types.js';

export { StringSchema, string } from './schemas/string.js';

export { NumberSchema, number } from './schemas/number.js';
export { BooleanSchema, boolean } from './schemas/boolean.js';

export { LiteralSchema, literal } from './schemas/literal.js';

export { UnionSchema, union } from './schemas/union.js';

export { ObjectSchema, object } from './schemas/object.js';

export { ArraySchema, array } from './schemas/array.js';

export type { Infer } from './types.js';
