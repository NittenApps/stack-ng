import { CatalogValue } from './catalog-value';

/**
 * Represents a catalog definition and its current metadata.
 *
 * @property id - Unique identifier for the catalog.
 * @property code - Logical code used to identify the catalog.
 * @property name - Display name of the catalog.
 * @property description - Human-readable description of the catalog.
 * @property sortBy - Field used to sort items within the catalog.
 * @property active - Indicates whether the catalog is active and available for use.
 * @property attributes - List of catalog attributes that define its schema.
 * @property values - List of values available in the catalog.
 * @property version - Current version number of the catalog definition.
 */
export type Catalog = {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  sortBy?: string;
  active?: boolean;
  attributes?: {
    code?: string;
    name?: string;
    description?: string;
    type?: string;
    required?: boolean;
    definition: { [key: string]: string | boolean | number };
  }[];
  values?: CatalogValue[];
  version?: number;
};
