import { Injectable } from '@angular/core';
import { ListState } from '../types/list-state';
import { Filter } from '../types';

/** Service to save and restore the basic state of a list. */
@Injectable({ providedIn: 'root' })
export class ListStateService {
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

  remove(): void {
    localStorage.removeItem('list-state');
  }

  save(id: string, page: number, size: number, order?: string[], filter?: Filter): void {
    const state: ListState = { i: id, p: page, s: size, o: order, f: filter };
    localStorage.setItem('list-state', JSON.stringify(state));
  }
}
