import { Catalog } from '../common';

/**
 * Defines validation, display, and access-control settings for a field.
 */
export interface Definition {
  /** Indicates whether the field is required. */
  required?: string;
  /** Indicates whether the field accepts multiple values. */
  multiple?: boolean;
  /** Controls whether the field is hidden. */
  hide?: string;
  /** Controls whether the field is read-only. */
  readonly?: string;
  /** Specifies the field's format. */
  format?: string;
  /** Regular expression used to validate the field. */
  pattern?: string;
  /** Minimum allowed length. */
  minLength?: number;
  /** Maximum allowed length. */
  maxLength?: number;
  /** Minimum allowed value. */
  min?: string;
  /** Maximum allowed value. */
  max?: string;
  /** Catalog used by the field. */
  catalog?: string | Catalog;
  /** Reference to another definition or field. */
  reference?: string;
  /** Name of the base definition. */
  base?: string;
  /** Roles permitted to view the field. */
  viewerRoles: string[];
  /** Roles permitted to edit the field. */
  editorRoles: string[];
}
