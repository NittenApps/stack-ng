import { Activity } from './activity';
import { Component } from './component';

/**
 * Represents a feature module in the application.
 * A module extends a base component and may include one or more activities.
 */
export interface Module extends Component {
  /**
   * Activities associated with this module.
   */
  activities?: Activity[];
}
