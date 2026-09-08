import { Component } from './component';
import { Field } from './field';

/**
 * Represents a group of related form fields.
 *
 * Extends the base component interface and includes a collection of fields
 * that belong to the same logical group.
 */
export interface FieldGroup extends Component {
  /**
   * The fields contained within this group.
   *
   * Optional because a group may be defined without any fields yet.
   */
  fields?: Field[];
}
