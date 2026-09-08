import { AttributeValue } from './attribute-value';

/**
 * Represents a catalog value item and its associated metadata.
 *
 * @property id - Unique identifier of the catalog value.
 * @property catalogCode - Code of the parent catalog.
 * @property code - Code of the catalog value.
 * @property name - Display name of the catalog value.
 * @property description - Description of the catalog value.
 * @property catalogValue - Parent catalog reference containing its code and name.
 * @property attributes - Attributes mapped by key to a list of attribute values.
 */
export type CatalogValue = {
  id?: string;
  catalogCode?: string;
  code?: string;
  name?: string;
  description?: string;
  catalogValue?: { code?: string; name?: string };
  attributes?: { [key: string]: AttributeValue[] };
};
