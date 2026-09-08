/**
 * Represents an object that can report whether it has unsaved changes.
 */
export interface DirtyAware {
  /**
   * Returns whether the object has unsaved or pending changes.
   *
   * @returns {boolean} True when the object is dirty; otherwise, false.
   */
  isDirty(): boolean;
}
