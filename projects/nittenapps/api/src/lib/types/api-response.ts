import { ApiMessage } from './api-message';
import { ListBody } from './list-body';
import { ObjectBody } from './object-body';

/** Standard response format used by the stack endpoints. */
export type ApiResponse<T, B = ListBody<T> | ObjectBody<T>> = {
  code: number;
  body: B;
  messages?: ApiMessage[];
  success: boolean;
};
