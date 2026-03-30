import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

/** Traduce al español los textos de la paginacion */
@Injectable()
export class ESPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel: string = 'Primera página';
  itemsPerPageLabel: string = 'Elementos por página';
  lastPageLabel: string = 'Última página';
  nextPageLabel: string = 'Siguiente página';
  previousPageLabel: string = 'Página anterior';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length == 0) {
      return '0 de 0';
    }
    const first = page * pageSize + 1;
    const last = (page + 1) * pageSize;
    return `${first} - ${last > length ? length : last} de ${length}`;
  }
}
