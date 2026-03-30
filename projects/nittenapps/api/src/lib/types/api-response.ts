import { ApiMessage } from './api-message';
import { ListBody } from './list-body';
import { ObjectBody } from './object-body';

/** Forma estándar de respuesta utilizada por los endpoints del stack. */
export type ApiResponse<T, B = ListBody<T> | ObjectBody<T>> = {
  code: number;
  body: B;
  messages?: ApiMessage[];
  success: boolean;
};
