import { HttpClient, HttpParams } from '@angular/common/http';
import { FieldGroup } from '@nittenapps/common';
import { map, Observable } from 'rxjs';

import { ApiConfig, ApiResponse, ListBody, ObjectBody } from '../types';

/**
 * Generic service for `/activity/v1/:activity` endpoints.
 * It allows common operations such as list queries, detail retrieval,
 * saving, and execution of additional methods.
 */
export class ActivityService<T> {
  constructor(private config: ApiConfig, private http: HttpClient, private activity: string) {}
 /**
   * Executes a GET query on a specific activity method.
   * @param method Name of the additional method or resource.
   * @param params Parameters sent in the query.
   * @returns Observable with the API response.
   */
  get<R = any>(
    method: string,
    params: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  ): Observable<ApiResponse<R, ListBody<R> | ObjectBody<R>>> {
    return this.http.get<ApiResponse<R, ListBody<R> | ObjectBody<R>>>(
      `${this.config.baseUrl}/activity/v1/${this.activity}/${method}`,
      { params: this.removeNullishValues(params) }
    );
  }

/**
   * Gets the field groups configured for the current activity.
   * @returns Observable with the list of field groups.
   */
  getFieldGroups(): Observable<FieldGroup[]> {
    return this.http
      .get<ApiResponse<FieldGroup, ListBody<FieldGroup>>>(
        `${this.config.baseUrl}/activity/v1/${this.activity}/fieldGroups`
      )
      .pipe(map((response) => response.body.items));
  }

  /**
   * Gets the list of activity records with optional parameters.
   * @param page Page number to query.
   * @param pageSize Number of items per page.
   * @param sort Sort field.
   * @param filter Filters sent as query parameters.
   * @returns Observable with the paginated list of records.
   */
  getList(
    page?: number,
    pageSize?: number,
    sort?: string,
    filter?: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
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
   * Gets a record by its id.
   * @param id Record identifier.
   * @returns Observable with the requested object.
   */
  getObject(id: string): Observable<ApiResponse<T, ObjectBody<T>>> {
    return this.http.get<ApiResponse<T, ObjectBody<T>>>(`${this.config.baseUrl}/activity/v1/${this.activity}/${id}`);
  }

  /**
   * Executes a POST action on an activity method.
   * @param method Name of the method or resource with activity-specific logic.
   * @param params Parameters sent in the query.
   * @param body Request body.
   * @returns Observable with the API response.
   */
  post<R = any>(
    method: string,
    params: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    body: any
  ): Observable<ApiResponse<R, ListBody<R> | ObjectBody<R>>> {
    return this.http.post<ApiResponse<R, ListBody<R> | ObjectBody<R>>>(
      `${this.config.baseUrl}/activity/v1/${this.activity}/${method}`,
      body,
      { params: this.removeNullishValues(params) }
    );
  }

  /**
   * Saves a record of the current activity.
   * @param object Object to save.
   * @returns Observable with the saved record.
   */
  save(object: T): Observable<ApiResponse<T, ObjectBody<T>>> {
    return this.http.post<ApiResponse<T, ObjectBody<T>>>(`${this.config.baseUrl}/activity/v1/${this.activity}`, object);
  }

  private removeNullishValues(params: any): any {
    return Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null));
  }
}
