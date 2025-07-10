import { Activity } from './activity';
import { Component } from './component';

export interface Module extends Component {
  activities?: Activity[];
}
