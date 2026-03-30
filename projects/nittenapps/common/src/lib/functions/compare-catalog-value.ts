import { CatalogValue } from '../types/catalog-value';

/** Compara dos valores de catálogo por id o por sus códigos equivalentes. */
export function compareCatalogValueFn(v1: CatalogValue, v2: any): boolean {
  return (
    v1 &&
    v2 &&
    ((v1.id && v1.id === v2.id) || v1.code === v2.code || v1.code === v2.valueCode || v1.code === v2.valueCatalog?.code)
  );
}
