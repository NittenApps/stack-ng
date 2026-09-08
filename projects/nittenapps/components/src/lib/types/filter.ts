/**
 * Represents a collection of filter criteria keyed by field name.
 *
 * Values may be scalar strings, numbers, or booleans, or readonly arrays of
 * strings and numbers for criteria that accept multiple values.
 */
export type Filter = { [key: string]: string | number | boolean | readonly (string | number)[] };
