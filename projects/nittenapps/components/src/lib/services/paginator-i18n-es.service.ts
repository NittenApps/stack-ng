import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

/**
 * Provides Spanish labels and range formatting for an Angular Material paginator.
 */
@Injectable()
export class ESPaginatorIntl implements MatPaginatorIntl {
  /** Emits a notification when paginator labels change. */
  changes = new Subject<void>();

  /** Label for the first-page button. */
  firstPageLabel: string = 'Primera página';
  /** Label for the items-per-page selector. */
  itemsPerPageLabel: string = 'Elementos por página';
  /** Label for the last-page button. */
  lastPageLabel: string = 'Última página';
  /** Label for the next-page button. */
  nextPageLabel: string = 'Siguiente página';
  /** Label for the previous-page button. */
  previousPageLabel: string = 'Página anterior';

  /**
   * Formats the visible item range in Spanish.
   *
   * @param page Zero-based page index.
   * @param pageSize Number of items displayed per page.
   * @param length Total number of items.
   * @returns The formatted range, or `0 de 0` when there are no items.
   */
  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length == 0) {
      return '0 de 0';
    }
    const first = page * pageSize + 1;
    const last = (page + 1) * pageSize;
    return `${first} - ${last > length ? length : last} de ${length}`;
  }
}
