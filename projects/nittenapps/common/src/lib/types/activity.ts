import { Component } from './component';
import { FieldGroup } from './field-group';

/**
 * Represents an activity, which is a reusable component that may contain a collection of field groups.
 *
 * @extends Component
 */
export interface Activity extends Component {
  /**
   * Optional list of field groups that belong to this activity.
   */
  fieldGroups?: FieldGroup[];
}
