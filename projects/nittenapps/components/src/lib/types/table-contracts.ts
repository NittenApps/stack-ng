import { SortDirection } from '@angular/material/sort';
import { Filters } from './filters';

export interface TableRequestParams {
  filters: Filters;
  pageIndex: number;
  pageSize: number;
  sort?: string;
  direction?: SortDirection;
}

export interface TableResponse<T = any> {
  items: T[];
  total: number;
}
