import { Component } from './component';
import { FieldGroup } from './field-group';

export interface Activity extends Component {
  fieldGroups?: FieldGroup[];
}
