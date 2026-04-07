import { HttpClient, HttpParams } from '@angular/common/http';
import { AttributeValue, Catalog, CatalogValue } from '@nittenapps/common';
import { map, Observable } from 'rxjs';

import { ApiConfig, ApiResponse, ListBody, ObjectBody } from '../types';

/** Client for catalog and parameter queries in the configuration module. */
export class ConfigService {
  constructor(
    private config: ApiConfig,
    private http: HttpClient,
  ) {}
  /**
   * Gets a specific value from a catalog.
   * @param catalogCode Catalog code.
   * @param code Value code
   * @returns Observable with the found value.
   */
  getCatalogValue(catalogCode: string, code: string): Observable<CatalogValue> {
    return this.http
      .get<
        ApiResponse<CatalogValue, ObjectBody<CatalogValue>>
      >(`${this.config.baseUrl}/config/v1/catalog-values/${catalogCode}/${code}`)
      .pipe(map((response) => response.body.object));
  }

  /**
   * Gets the values of a catalog.
   * @param catalogCode Code.
   * @param params Optional parameters to filter the query.
   * @returns Observable with the list of catalog values.
   */
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

  /**
   * Gets the list of available catalogs.
   * @param params Optional parameters to filter the query.
   * @returns Observable with the list of catalogs.
   */
  getCatalogs(
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
  ): Observable<Catalog[]> {
    return this.http
      .get<ApiResponse<Catalog, ListBody<Catalog>>>(`${this.config.baseUrl}/config/v1/catalogs`, {
        params,
      })
      .pipe(map((response) => response.body.items));
  }

  /**
   * Gets the value of a configuration parameter.
   * @param paramCode Parameter code.
   * @returns Observable with the parameter value.
   */
  getParameter(paramCode: string): Observable<AttributeValue> {
    return this.http
      .get<
        ApiResponse<AttributeValue, ObjectBody<AttributeValue>>
      >(`${this.config.baseUrl}/config/v1/parameters/${paramCode}`)
      .pipe(map((response) => response.body.object));
  }
}
