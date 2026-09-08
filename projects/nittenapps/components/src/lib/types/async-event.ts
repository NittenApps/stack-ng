/**
 * Represents an asynchronous event that can be completed explicitly.
 */
export interface AsyncEvent {
  /**
   * Completes the asynchronous event.
   */
  resolve: () => void;
}
