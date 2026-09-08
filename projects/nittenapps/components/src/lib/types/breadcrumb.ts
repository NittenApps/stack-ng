/**
 * Represents a single breadcrumb item used in navigation.
 *
 * @typedef {Object} Breadcrumb
 * @property {boolean} disabled Indicates whether the breadcrumb item is disabled.
 * @property {string} label The visible label for the breadcrumb item.
 * @property {string} url The destination URL for the breadcrumb item.
 */
export type Breadcrumb = {
  disabled: boolean;
  label: string;
  url: string;
};

/**
 * Represents the configuration used to build a breadcrumb item from a data object.
 *
 * @typedef {Object} BreadcrumbConfig
 * @property {boolean | undefined} disabled Indicates whether the breadcrumb item should be disabled.
 * @property {string | number | ((data: any) => string | number)} label The breadcrumb label, either as a static value or a function that resolves a value from the provided data.
 */
export type BreadcrumbConfig = {
  disabled: boolean | undefined;
  label: string | number | ((data: any) => string | number);
};
