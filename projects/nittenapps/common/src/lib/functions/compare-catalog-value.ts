import { CatalogValue } from '../types/catalog-value';

/**
 * Compares a catalog value with another value by identifier or code.
 *
 * @param v1 The catalog value to compare.
 * @param v2 The value to compare against.
 * @returns Whether the values represent the same catalog value.
 */
export function compareCatalogValueFn(v1: CatalogValue, v2: any): boolean {
  return (
    v1 &&
    v2 &&
    ((v1.id && v1.id === v2.id) || v1.code === v2.code || v1.code === v2.valueCode || v1.code === v2.valueCatalog?.code)
  );
}
