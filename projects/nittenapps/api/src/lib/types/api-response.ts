import { ApiMessage } from './api-message';
import { ListBody } from './list-body';
import { ObjectBody } from './object-body';

/**
 * Represents the standard API response envelope.
 *
 * @typeParam T - The type of the response data.
 * @typeParam B - The response body type.
 */
export type ApiResponse<T, B = ListBody<T> | ObjectBody<T>> = {
  /** HTTP or application response code. */
  code: number;
  /** Response payload. */
  body: B;
  /** Optional messages returned with the response. */
  messages?: ApiMessage[];
  /** Whether the request completed successfully. */
  success: boolean;
};
