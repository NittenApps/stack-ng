import { IconProp } from '@fortawesome/fontawesome-svg-core';

type booleanFunc = (item?: NavItem) => boolean;
type stringFunc = (item?: NavItem) => string;

/** Type base para elementos del menú de navegación. */
export type NavItem = {
  attrs?: {
    [k: string]: any;
  };
  badge?: string | stringFunc;
  badgeStyleClass?: string | stringFunc;
  children?: NavItem[];
  command?: (event?: any, item?: NavItem) => void;
  disabled?: boolean | booleanFunc;
  expanded?: boolean | booleanFunc;
  hidden?: boolean | booleanFunc;
  icon?: string | IconProp;
  iconClass?: string | stringFunc;
  iconSet?: string;
  id?: string;
  label?: string | stringFunc;
  queryParams?: {
    [k: string]: any;
  };
  roles?: string | string[];
  routerLink?: any;
  routerLinkActiveOptions?: any;
  separator?: boolean;
  style?: any;
  styleClass?: any;
  swapOpacity?: boolean;
  target?: string;
  title?: string | stringFunc;
  url?: string | stringFunc;
};
