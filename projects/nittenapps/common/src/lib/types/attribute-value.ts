import { CatalogValue } from './catalog-value';

export type AttributeValue = {
  codeValue?: string;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
  booleanValue?: boolean;
  textValue?: string;
  catalogValue?: CatalogValue;
};
