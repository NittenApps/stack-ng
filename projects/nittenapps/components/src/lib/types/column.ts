import { IconProp } from '@fortawesome/fontawesome-svg-core';

/** Returns an icon for a column and its associated item. */
type iconFunc = (id: string, item?: any) => IconProp | undefined;

/** Returns a string value for a column and its associated item. */
type stringFunc = (id: string, item?: any) => string;

/** Defines the configuration used to render a data table column. */
export type Column = {
  /** Unique identifier for the column. */
  id: string;
  /** Data type used to render and format the column values. */
  type?: 'string' | 'decimal' | 'integer' | 'percent' | 'date' | 'datetime' | 'icon';
  /** Optional format string used when displaying values. */
  format?: string;
  /** Field name used to retrieve values from an item. */
  field?: string;
  /** Display title for the column. */
  title: string;
  /** Whether the column can be sorted. */
  sortable?: boolean;
  /** Static value or function that returns the column value. */
  value?: string | stringFunc;
  /** Static icon or function that returns the column icon. */
  icon?: IconProp | iconFunc;
  /** Static CSS class or function that returns the column CSS class. */
  class?: string | stringFunc;
};
