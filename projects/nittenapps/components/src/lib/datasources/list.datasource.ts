import { DataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { ActivityService, ApiConfig } from '@nittenapps/api';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { Filter } from '../types';

/**
 * Data source for paginated list data backed by an activity endpoint.
 *
 * This class wraps an {@link ActivityService} and exposes the current list of
 * items through an RxJS {@link BehaviorSubject}. It keeps track of the total
 * number of items returned by the API and updates the subject whenever a new
 * page of data is loaded.
 *
 * @template T The type of the items contained in the list.
 */
export class ListDataSource<T> extends DataSource<T> {
  /**
   * Total number of items available across all pages.
   */
  totalItems = 0;

  private activityService: ActivityService<T>;
  private listSubject = new BehaviorSubject<T[]>([]);

  /**
   * Creates a list data source bound to a specific API activity.
   *
   * @param config API configuration used to create the underlying service.
   * @param http HTTP client used by the underlying activity service.
   * @param activity Name of the activity endpoint to query.
   */
  constructor(config: ApiConfig, http: HttpClient, activity: string) {
    super();
    this.activityService = new ActivityService<T>(config, http, activity);
  }

  /**
   * Returns the observable stream that emits the current list contents.
   *
   * @returns An observable of the list items.
   */
  connect(): Observable<T[]> {
    return this.listSubject.asObservable();
  }

  /**
   * Completes the internal list subject and releases the underlying stream.
   */
  disconnect(): void {
    this.listSubject.complete();
  }

  /**
   * Loads a page of items from the configured activity endpoint.
   *
   * The response is normalized to a `{ code, body: { items, page, total } }`
   * shape in case of error, and the local `totalItems` value as well as the
   * internal subject are updated with the successful response payload.
   *
   * @param page Optional page number to request.
   * @param pageSize Optional number of items per page.
   * @param sort Optional sort expression.
   * @param filter Optional filter criteria.
   * @returns Observable with the API response.
   */
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
