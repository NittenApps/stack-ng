import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { FieldGroup, SKIP_LOADING } from '@nittenapps/common';
import { map, Observable } from 'rxjs';
import { ApiConfig, ApiResponse, ListBody, ObjectBody } from '../types';

/**
 * Base service for interacting with a specific activity endpoint.
 *
 * Provides an abstraction over the activity API used by the application,
 * including list and object retrieval, custom action calls, and persistence.
 *
 * @template T Type of the activity entity returned by the API.
 */
export class ActivityService<T> {
  /**
   * Creates an activity service bound to a concrete API configuration and activity route.
   *
   * @param config Shared API configuration used to build request URLs.
   * @param http Angular HTTP client used to perform requests.
   * @param activity Activity identifier that is appended to the activity base path.
   */
  constructor(
    private config: ApiConfig,
    private http: HttpClient,
    private activity: string,
  ) {}

  /**
   * Performs a GET request to a custom activity method.
   *
   * @template R Response payload type returned by the API.
   * @param method Activity method name to call.
   * @param params Query parameters to include in the request.
   * @param skipIndicator Whether the global loading indicator should be skipped.
   * @returns Observable emitting the API response.
   */
  get<R = any>(
    method: string,
    params: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    skipIndicator = false,
  ): Observable<ApiResponse<R, ListBody<R> | ObjectBody<R>>> {
    return this.http.get<ApiResponse<R, ListBody<R> | ObjectBody<R>>>(
      `${this.config.baseUrl}/activity/v1/${this.activity}/${method}`,
      { params: this.removeNullishValues(params), context: new HttpContext().set(SKIP_LOADING, skipIndicator) },
    );
  }

  /**
   * Fetches the field groups for the current activity.
   *
   * @returns Observable emitting the field group collection.
   */
  getFieldGroups(): Observable<FieldGroup[]> {
    return this.http
      .get<
        ApiResponse<FieldGroup, ListBody<FieldGroup>>
      >(`${this.config.baseUrl}/activity/v1/${this.activity}/fieldGroups`)
      .pipe(map((response) => response.body.items));
  }

  /**
   * Retrieves a paginated list of activity records.
   *
   * @param page Optional page number.
   * @param pageSize Optional page size.
   * @param sort Optional sorting expression.
   * @param filter Optional filter values applied to the request.
   * @returns Observable emitting the paginated API response.
   */
  getList(
    page?: number,
    pageSize?: number,
    sort?: string,
    filter?: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
  ): Observable<ApiResponse<T, ListBody<T>>> {
    const params = this.removeNullishValues(filter) || {};
    if (page) {
      params['page'] = page;
    }
    if (pageSize) {
      params['pageSize'] = pageSize;
    }
    if (sort) {
      params['sort'] = sort;
    }
    return this.http.get<ApiResponse<T, ListBody<T>>>(`${this.config.baseUrl}/activity/v1/${this.activity}`, {
      params,
    });
  }

  /**
   * Fetches a single activity object by identifier.
   *
   * @param id Unique identifier of the object to retrieve.
   * @returns Observable emitting the object API response.
   */
  getObject(id: string): Observable<ApiResponse<T, ObjectBody<T>>> {
    return this.http.get<ApiResponse<T, ObjectBody<T>>>(`${this.config.baseUrl}/activity/v1/${this.activity}/${id}`);
  }

  /**
   * Performs a POST request to a custom activity method.
   *
   * @template R Response payload type returned by the API.
   * @param method Activity method name to call.
   * @param params Query parameters to include in the request.
   * @param body Request body to send.
   * @param skipIndicator Whether the global loading indicator should be skipped.
   * @returns Observable emitting the API response.
   */
  post<R = any>(
    method: string,
    params: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    body: any,
    skipIndicator = false,
  ): Observable<ApiResponse<R, ListBody<R> | ObjectBody<R>>> {
    return this.http.post<ApiResponse<R, ListBody<R> | ObjectBody<R>>>(
      `${this.config.baseUrl}/activity/v1/${this.activity}/${method}`,
      body,
      { params: this.removeNullishValues(params), context: new HttpContext().set(SKIP_LOADING, skipIndicator) },
    );
  }

  /**
   * Saves or creates an activity object.
   *
   * @param object Entity payload to persist.
   * @returns Observable emitting the saved object response.
   */
  save(object: T): Observable<ApiResponse<T, ObjectBody<T>>> {
    return this.http.post<ApiResponse<T, ObjectBody<T>>>(`${this.config.baseUrl}/activity/v1/${this.activity}`, object);
  }

  /**
   * Removes null and undefined values from a parameter object.
   *
   * @param params Raw query parameter map.
   * @returns Query parameter map without nullish values.
   */
  private removeNullishValues(params: any): any {
    return Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null));
  }
}
