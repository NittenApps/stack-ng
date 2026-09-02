import { Catalog } from '../common';

export interface Definition {
  required?: string;
  multiple?: boolean;
  hide?: string;
  readonly?: string;
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: string;
  max?: string;
  catalog?: string | Catalog;
  reference?: string;
  base?: string;
  viewerRoles: string[];
  editorRoles: string[];
}
