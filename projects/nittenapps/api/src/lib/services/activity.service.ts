import { HttpClient, HttpParams } from '@angular/common/http';
import { FieldGroup } from '@nittenapps/common';
import { map, Observable } from 'rxjs';

import { ApiConfig, ApiResponse, ListBody, ObjectBody } from '../types';

/**
 * Servicio genérico para endpoints `/activity/v1/:activity`.
 * Permite operaciones comunes como consulta de lista, detalle,
 * guardado y ejecución de métodos adicionales.
 */
export class ActivityService<T> {
  constructor(private config: ApiConfig, private http: HttpClient, private activity: string) {}
 /**
   * Ejecuta una consulta GET sobre un método específico de la activity.
   * @param method Nombre del método o recurso adicional.
   * @param params Parámetros enviados en la consulta.
   * @returns Observable con la respuesta de la API.
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
   * Obtiene los grupos de campos configurados para la activity actual.
   * @returns Observable con la lista de grupos de campos.
   */
  getFieldGroups(): Observable<FieldGroup[]> {
    return this.http
      .get<ApiResponse<FieldGroup, ListBody<FieldGroup>>>(
        `${this.config.baseUrl}/activity/v1/${this.activity}/fieldGroups`
      )
      .pipe(map((response) => response.body.items));
  }

  /**
   * Obtiene la lista de registros de la activity con parametros opcionales.
   * @param page Número de página a consultar.
   * @param pageSize Cantidad de elementos por página.
   * @param sort Campo de ordenamiento.
   * @param filter Filtros enviados como parámetros de consulta.
   * @returns Observable con la lista paginada de registros.
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
   * Obtiene un registro por su id.
   * @param id Identificador del registro.
   * @returns Observable con el objeto solicitado.
   */
  getObject(id: string): Observable<ApiResponse<T, ObjectBody<T>>> {
    return this.http.get<ApiResponse<T, ObjectBody<T>>>(`${this.config.baseUrl}/activity/v1/${this.activity}/${id}`);
  }

  /**
   * Ejecuta una acción POST sobre un método de la activity.
   * @param method Nombre del método o recurso con logica especifica del activity.
   * @param params Parámetros enviados en la consulta.
   * @param body Cuerpo de la petición.
   * @returns Observable con la respuesta de la API.
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
   * Guarda un registro de la activity actual.
   * @param object Objeto a guardar.
   * @returns Observable con el registro guardado.
   */
  save(object: T): Observable<ApiResponse<T, ObjectBody<T>>> {
    return this.http.post<ApiResponse<T, ObjectBody<T>>>(`${this.config.baseUrl}/activity/v1/${this.activity}`, object);
  }

  private removeNullishValues(params: any): any {
    return Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null));
  }
}
