import { Filter } from './filter';

/** Represents the state used to retrieve and filter a list. */
export type ListState = {
  /** Identifier for the list or resource. */
  i: string;
  /** Current page number. */
  p: number;
  /** Number of items to display per page. */
  s: number;
  /** Fields used to order the list. */
  o?: string[];
  /** Optional filter applied to the list. */
  f?: Filter;
};
