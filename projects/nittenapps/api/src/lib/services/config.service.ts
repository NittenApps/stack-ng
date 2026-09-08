import { HttpClient, HttpParams } from '@angular/common/http';
import { AttributeValue, Catalog, CatalogValue } from '@nittenapps/common';
import { map, Observable } from 'rxjs';
import { ApiConfig, ApiResponse, ListBody, ObjectBody } from '../types';

/**
 * Provides access to configuration metadata exposed by the API.
 *
 * This service centralizes requests for catalog values, catalog lists,
 * and parameter lookups used across the application.
 */
export class ConfigService {
  /**
   * Creates a configuration service instance.
   *
   * @param config API configuration settings used to build request URLs.
   * @param http Angular HTTP client used to perform requests.
   */
  constructor(
    private config: ApiConfig,
    private http: HttpClient,
  ) {}

  /**
   * Fetches a single catalog value by its catalog and code.
   *
   * @param catalogCode Code of the catalog containing the value.
   * @param code Value code to retrieve.
   * @returns An observable that emits the requested catalog value.
   */
  getCatalogValue(catalogCode: string, code: string): Observable<CatalogValue> {
    return this.http
      .get<
        ApiResponse<CatalogValue, ObjectBody<CatalogValue>>
      >(`${this.config.baseUrl}/config/v1/catalog-values/${catalogCode}/${code}`)
      .pipe(map((response) => response.body.object));
  }

  /**
   * Fetches all catalog values for a given catalog.
   *
   * @param catalogCode Code of the catalog whose values should be returned.
   * @param params Optional query parameters to filter or paginate the request.
   * @returns An observable that emits a list of catalog values.
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
   * Fetches the available catalogs.
   *
   * @param params Optional query parameters to filter or paginate the request.
   * @returns An observable that emits the list of catalogs.
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
   * Fetches a single application parameter by its code.
   *
   * @param paramCode Code of the parameter to retrieve.
   * @returns An observable that emits the requested parameter value.
   */
  getParameter(paramCode: string): Observable<AttributeValue> {
    return this.http
      .get<
        ApiResponse<AttributeValue, ObjectBody<AttributeValue>>
      >(`${this.config.baseUrl}/config/v1/parameters/${paramCode}`)
      .pipe(map((response) => response.body.object));
  }
}
