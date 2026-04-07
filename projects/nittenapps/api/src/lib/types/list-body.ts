/** Expected body for paginated list responses. */
export type ListBody<T> = {
  items: T[];
  page: number;
  total: number;
};
