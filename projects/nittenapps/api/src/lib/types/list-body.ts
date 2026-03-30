/** Cuerpo esperado para respuestas de tipo listado paginado. */
export type ListBody<T> = {
  items: T[];
  page: number;
  total: number;
};
