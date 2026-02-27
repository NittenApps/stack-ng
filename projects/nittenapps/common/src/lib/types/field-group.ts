import { Component } from './component';
import { Field } from './field';

export interface FieldGroup extends Component {
  fields?: Field[];
}
