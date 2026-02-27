export interface Definition {
  required?: string;
  multiple?: boolean;
  hide?: string;
  readonly?: string;
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  catalog?: string;
  reference?: string;
  base?: string;
  viewerRoles: string[];
  editorRoles: string[];
}
