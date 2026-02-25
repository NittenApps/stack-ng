import { HttpClient, HttpParams } from '@angular/common/http';
import { AttributeValue, Catalog, CatalogValue } from '@nittenapps/common';
import { map, Observable } from 'rxjs';

import { ApiConfig, ApiResponse, ListBody, ObjectBody } from '../types';

export class ConfigService {
  constructor(
    private config: ApiConfig,
    private http: HttpClient,
  ) {}

  getCatalogValue(catalogCode: string, code: string): Observable<CatalogValue> {
    return this.http
      .get<
        ApiResponse<CatalogValue, ObjectBody<CatalogValue>>
      >(`${this.config.baseUrl}/config/v1/catalog-values/${catalogCode}/${code}`)
      .pipe(map((response) => response.body.object));
  }

  getCatalogValues(
    catalogCode: string,
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
  ): Observable<CatalogValue[]> {
    return this.http
      .get<ApiResponse<CatalogValue, ListBody<CatalogValue>>>(
        `${this.config.baseUrl}/config/v1/catalog-values/${catalogCode}`,
        {
          params,
        },
      )
      .pipe(map((response) => response.body.items));
  }

  getCatalogs(
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
  ): Observable<Catalog[]> {
    return this.http
      .get<ApiResponse<Catalog, ListBody<Catalog>>>(`${this.config.baseUrl}/config/v1/catalogs`, {
        params,
      })
      .pipe(map((response) => response.body.items));
  }

  getParameter(paramCode: string): Observable<AttributeValue> {
    return this.http
      .get<
        ApiResponse<AttributeValue, ObjectBody<AttributeValue>>
      >(`${this.config.baseUrl}/config/v1/parameters/${paramCode}`)
      .pipe(map((response) => response.body.object));
  }
}
