import { HttpClient, HttpParams } from '@angular/common/http';
import { AttributeValue, Catalog, CatalogValue } from '@nittenapps/common';
import { map, Observable } from 'rxjs';

import { ApiConfig, ApiResponse, ListBody, ObjectBody } from '../types';

/** Cliente para consultas de catálogos y parámetros del módulo de configuración. */
export class ConfigService {
  constructor(
    private config: ApiConfig,
    private http: HttpClient,
  ) {}
  /**
   * Obtiene un valor específico de un catálogo.
   * @param catalogCode Código del catálogo.
   * @param code Código del valor
   * @returns Observable con el valor encontrado.
   */
  getCatalogValue(catalogCode: string, code: string): Observable<CatalogValue> {
    return this.http
      .get<
        ApiResponse<CatalogValue, ObjectBody<CatalogValue>>
      >(`${this.config.baseUrl}/config/v1/catalog-values/${catalogCode}/${code}`)
      .pipe(map((response) => response.body.object));
  }

  /**
   * Obtiene los valores de un catálogo.
   * @param catalogCode Código.
   * @param params Parámetros opcionales para filtrar la consulta.
   * @returns Observable con la lista de valores del catálogo.
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
   * Obtiene la lista de catálogos disponibles.
   * @param params Parámetros opcionales para filtrar la consulta.
   * @returns Observable con la lista de catálogos.
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
   * Obtiene el valor de un parámetro de configuración.
   * @param paramCode Código del parámetro.
   * @returns Observable con el valor del parámetro.
   */
  getParameter(paramCode: string): Observable<AttributeValue> {
    return this.http
      .get<
        ApiResponse<AttributeValue, ObjectBody<AttributeValue>>
      >(`${this.config.baseUrl}/config/v1/parameters/${paramCode}`)
      .pipe(map((response) => response.body.object));
  }
}
