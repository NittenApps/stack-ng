import { Component } from './component';
import { Property } from './property';

export interface PropertyGroup extends Component {
  properties?: Property[];
}
