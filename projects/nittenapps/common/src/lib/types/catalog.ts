import { CatalogValue } from './catalog-value';

export type Catalog = {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  sortBy?: string;
  active?: boolean;
  attributes?: {
    code?: string;
    name?: string;
    description?: string;
    type?: string;
    required?: boolean;
    definition: { [key: string]: string | boolean | number };
  }[];
  values?: CatalogValue[];
  version?: number;
};
