import { HttpClient, HttpParams } from '@angular/common/http';
import { FieldGroup } from '@nittenapps/common';
import { map, Observable } from 'rxjs';

import { ApiConfig, ApiResponse, ListBody, ObjectBody } from '../types';

export class ActivityService<T> {
  constructor(private config: ApiConfig, private http: HttpClient, private activity: string) {}

  get<R = any>(
    method: string,
    params: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
  ): Observable<ApiResponse<R, ListBody<R> | ObjectBody<R>>> {
    return this.http.get<ApiResponse<R, ListBody<R> | ObjectBody<R>>>(
      `${this.config.baseUrl}/activity/v1/${this.activity}/${method}`,
      { params: this.removeNullishValues(params) }
    );
  }

  getFieldGroups(): Observable<FieldGroup[]> {
    return this.http
      .get<ApiResponse<FieldGroup, ListBody<FieldGroup>>>(
        `${this.config.baseUrl}/activity/v1/${this.activity}/fieldGroups`
      )
      .pipe(map((response) => response.body.items));
  }

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

  getObject(id: string): Observable<ApiResponse<T, ObjectBody<T>>> {
    return this.http.get<ApiResponse<T, ObjectBody<T>>>(`${this.config.baseUrl}/activity/v1/${this.activity}/${id}`);
  }

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

  save(object: T): Observable<ApiResponse<T, ObjectBody<T>>> {
    return this.http.post<ApiResponse<T, ObjectBody<T>>>(`${this.config.baseUrl}/activity/v1/${this.activity}`, object);
  }

  private removeNullishValues(params: any): any {
    return Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null));
  }
}
