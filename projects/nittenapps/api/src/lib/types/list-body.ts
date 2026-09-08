/**
 * Represents a paginated list response.
 *
 * @typeParam T The type of each item in the list.
 */
export type ListBody<T> = {
  /** Items included in the current page. */
  items: T[];
  /** The current page number. */
  page: number;
  /** The total number of items across all pages. */
  total: number;
};
