import { DataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { ActivityService, ApiConfig } from '@nittenapps/api';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { Filter } from '../types';

/**
 * DataSource para cargar y exponer registros paginados de una actividad.
 */
export class ListDataSource<T> extends DataSource<T> {
  totalItems = 0;

  private activityService: ActivityService<T>;
  private listSubject = new BehaviorSubject<T[]>([]);

  constructor(config: ApiConfig, http: HttpClient, activity: string) {
    super();
    this.activityService = new ActivityService<T>(config, http, activity);
  }

  connect(): Observable<T[]> {
    return this.listSubject.asObservable();
  }

  disconnect(): void {
    this.listSubject.complete();
  }

  /**
   * Carga los registros de la actividad y actualiza la lista actual.
   * @param page Número de página a consultar.
   * @param pageSize Cantidad de registros por página.
   * @param sort Criterio de ordenamiento.
   * @param filter Filtros aplicados a la consulta.
   */
  loadItems(page?: number, pageSize?: number, sort?: string, filter?: Filter): void {
    this.activityService
      .getList(page, pageSize, sort, filter as any)
      .pipe(catchError(() => of({ code: 500, body: { items: [], page: 0, total: 0 } })))
      .subscribe((response) => {
        this.totalItems = response.body.total;
        this.listSubject.next(response.body.items);
      });
  }
}
