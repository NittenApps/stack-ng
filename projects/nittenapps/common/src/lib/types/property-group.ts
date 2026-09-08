import { Component } from './component';
import { Property } from './property';

/**
 * Represents a component that groups related properties.
 */
export interface PropertyGroup extends Component {
  /** Properties contained in the group. */
  properties?: Property[];
}
