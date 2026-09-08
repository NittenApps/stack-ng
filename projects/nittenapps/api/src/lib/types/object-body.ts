/**
 * Wraps a value inside an `object` property.
 *
 * @template T The type of the value being wrapped.
 */
export type ObjectBody<T> = {
  object: T;
};
