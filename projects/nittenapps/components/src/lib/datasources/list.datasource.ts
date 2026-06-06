import { DataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { ActivityService, ApiConfig } from '@nittenapps/api';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { Filter } from '../types';

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

  loadItems(page?: number, pageSize?: number, sort?: string, filter?: Filter): Observable<any> {
    return this.activityService.getList(page, pageSize, sort, filter as any).pipe(
      catchError(() => of({ code: 500, body: { items: [], page: 0, total: 0 } })),
      tap((response) => {
        this.totalItems = response.body.total;
        this.listSubject.next(response.body.items);
      }),
    );
  }
}
