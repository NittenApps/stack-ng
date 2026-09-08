import { IconProp } from '@fortawesome/fontawesome-svg-core';

type booleanFunc = (item?: NavItem) => boolean;
type stringFunc = (item?: NavItem) => string;

/**
 * Represents a single item in a navigation menu.
 *
 * Each item can define a label, icon, URL, badge, styling, and optional nested
 * children. Most display and behavior properties may be provided as either a
 * static value or a callback that resolves against the current item.
 */
export type NavItem = {
  /**
   * Additional HTML attributes to apply to the rendered item.
   */
  attrs?: {
    [k: string]: any;
  };
  /**
   * Badge text displayed alongside the item. Supports a static value or a function.
   */
  badge?: string | stringFunc;
  /**
   * CSS class applied to the badge element. Supports a static value or a function.
   */
  badgeStyleClass?: string | stringFunc;
  /**
   * Child navigation items rendered under this item.
   */
  children?: NavItem[];
  /**
   * Callback executed when the item is activated.
   *
   * @param event Optional event payload.
   * @param item The current navigation item.
   */
  command?: (event?: any, item?: NavItem) => void;
  /**
   * Whether the item is disabled. Supports a static value or a function.
   */
  disabled?: boolean | booleanFunc;
  /**
   * Whether the item is expanded. Supports a static value or a function.
   */
  expanded?: boolean | booleanFunc;
  /**
   * Whether the item is hidden. Supports a static value or a function.
   */
  hidden?: boolean | booleanFunc;
  /**
   * Icon for the item. Can be a CSS class name or a FontAwesome icon object.
   */
  icon?: string | IconProp;
  /**
   * CSS class applied to the icon. Supports a static value or a function.
   */
  iconClass?: string | stringFunc;
  /**
   * Icon set identifier used by custom icon libraries.
   */
  iconSet?: string;
  /**
   * Unique identifier for the item.
   */
  id?: string;
  /**
   * Text shown for the item. Supports a static value or a function.
   */
  label?: string | stringFunc;
  /**
   * Query parameters included when navigating to the item URL.
   */
  queryParams?: {
    [k: string]: any;
  };
  /**
   * Roles or accessibility permissions associated with the item.
   */
  roles?: string | string[];
  /**
   * Router link definition used for Angular navigation.
   */
  routerLink?: any;
  /**
   * Options applied when the item is active in the router.
   */
  routerLinkActiveOptions?: any;
  /**
   * Whether to render a separator instead of an item.
   */
  separator?: boolean;
  /**
   * Inline styles applied to the item.
   */
  style?: any;
  /**
   * CSS classes applied to the item container.
   */
  styleClass?: any;
  /**
   * Whether the icon opacity should be swapped when rendering.
   */
  swapOpacity?: boolean;
  /**
   * Target window or frame for the item's URL.
   */
  target?: string;
  /**
   * Tooltip or title text for the item. Supports a static value or a function.
   */
  title?: string | stringFunc;
  /**
   * URL or navigation target for the item. Supports a static value or a function.
   */
  url?: string | stringFunc;
};
