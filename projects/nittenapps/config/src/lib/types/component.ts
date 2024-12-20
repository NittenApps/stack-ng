import { Definition } from './definition';

export type Component = {
  id?: string;
  code?: string;
  name?: string;
  type?: string;
  description?: string;
  definition?: Definition;
  active?: boolean;
  version?: number;
};
