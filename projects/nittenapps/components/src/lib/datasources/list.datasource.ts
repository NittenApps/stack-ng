import { DataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { ActivityService, ApiConfig } from '@nittenapps/api';
import { BehaviorSubject, Observable, Subject, catchError, finalize, of, switchMap } from 'rxjs';
import { TableRequestParams } from '../types';

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
  private readonly activityService: ActivityService<T>;
  private readonly dataSubject = new BehaviorSubject<T[]>([]);
  private readonly loadSubject = new Subject<{ params: TableRequestParams; silent: boolean }>();
  private readonly totalSubject = new BehaviorSubject<number>(0);

  /** Emits when a data-loading operation finishes. */
  onLoaded$ = new Subject<void>();

  /** Emits the total number of items reported by the API. */
  total$ = this.totalSubject.asObservable();

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

    this.loadSubject
      .pipe(
        switchMap(({ params, silent }) => {
          const sort = !!params.sort ? `${params.sort} ${params.direction || ''}` : undefined;
          return this.activityService.getList(params.pageIndex, params.pageSize, sort, params.filters as any).pipe(
            catchError(() => of({ code: 500, body: { items: [], page: 0, total: 0 } })),
            finalize(() => {
              this.onLoaded$.next();
            }),
          );
        }),
      )
      .subscribe((response) => {
        this.dataSubject.next(response.body.items);
        this.totalSubject.next(response.body.total);
      });
  }

  /**
   * Returns the observable stream that emits the current list contents.
   *
   * @returns An observable of the list items.
   */
  connect(): Observable<T[]> {
    return this.dataSubject.asObservable();
  }

  /**
   * Completes the internal list subject and releases the underlying stream.
   */
  disconnect(): void {
    this.dataSubject.complete();
    this.totalSubject.complete();
    this.loadSubject.complete();
    this.onLoaded$.complete();
  }

  /**
   * Loads a page of list data using the supplied table parameters.
   *
   * @param params Pagination, sorting, and filtering parameters for the request.
   * @param silent Whether the request should be treated as silent by consumers.
   */
  loadData(params: TableRequestParams, silent = false): void {
    this.loadSubject.next({ params, silent });
  }
}
