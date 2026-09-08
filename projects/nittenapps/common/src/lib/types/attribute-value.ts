import { CatalogValue } from './catalog-value';

/**
 * Represents a value for an attribute, supporting multiple primitive and structured value types.
 *
 * This type is used to model attribute payloads where the underlying value may be stored as a
 * code, string, number, date, boolean, text, or catalog reference.
 */
export type AttributeValue = {
  /** The code representation of the attribute value. */
  codeValue?: string;
  /** The string representation of the attribute value. */
  stringValue?: string;
  /** The numeric representation of the attribute value. */
  numberValue?: number;
  /** The date representation of the attribute value. */
  dateValue?: Date;
  /** The boolean representation of the attribute value. */
  booleanValue?: boolean;
  /** The text representation of the attribute value. */
  textValue?: string;
  /** The catalog value associated with this attribute, when the value is defined by a catalog entry. */
  catalogValue?: CatalogValue;
};
