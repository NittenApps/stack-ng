import { Definition } from './definition';

/**
 * Represents a reusable application component.
 *
 * Components define the metadata and configuration required to describe a
 * specific part of an application or platform feature.
 */
export interface Component {
  /**
   * Unique identifier of the component.
   */
  id?: string;

  /**
   * Short code or key used to identify the component.
   */
  code?: string;

  /**
   * Human-readable name of the component.
   */
  name?: string;

  /**
   * Component type or category.
   */
  type?: string;

  /**
   * Detailed description of the component.
   */
  description?: string;

  /**
   * Definition metadata describing the component structure and behavior.
   */
  definition?: Definition;

  /**
   * Indicates whether the component is currently active.
   */
  active?: boolean;

  /**
   * Version number of the component.
   */
  version?: number;
}
