import { Injectable } from '@angular/core';
import { Filter, ListState } from '../types';

/**
 * Persists and retrieves list view state using browser local storage.
 */
@Injectable({ providedIn: 'root' })
export class ListStateService {
  /**
   * Retrieves the saved state for a list.
   *
   * @param id Identifier of the list whose state should be retrieved.
   * @returns The saved list state, or the default first page with 15 items.
   */
  get(id: string): ListState {
    const value = localStorage.getItem('list-state');
    // If no state is found, return default state
    if (value) {
      const state = JSON.parse(value);
      if (state.i === id) {
        return state;
      }
    }
    return { i: id, p: 0, s: 15 };
  }

  /**
   * Removes the persisted list state.
   */
  remove(): void {
    localStorage.removeItem('list-state');
  }

  /**
   * Saves the current state of a list.
   *
   * @param id Identifier of the list.
   * @param page Current page number.
   * @param size Number of items displayed per page.
   * @param order Optional sort order.
   * @param filter Optional list filter.
   */
  save(id: string, page: number, size: number, order?: string[], filter?: Filter): void {
    const state: ListState = { i: id, p: page, s: size, o: order, f: filter };
    localStorage.setItem('list-state', JSON.stringify(state));
  }
}
