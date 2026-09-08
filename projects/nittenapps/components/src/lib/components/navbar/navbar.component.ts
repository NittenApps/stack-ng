import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component, Input, Optional, ViewEncapsulation } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@nittenapps/auth';
import { TypeofPipe } from '@nittenapps/common';
import { NavItem } from '../../types/navbar-item';
import { IconComponent } from '../icon/icon.component';

const checkRoles = (roles: string[], navItem: NavItem): boolean => {
  if (navItem.roles) {
    const requiredRoles: string[] = [];
    if (typeof navItem.roles === 'string') {
      requiredRoles.push(navItem.roles);
    } else {
      requiredRoles.push(...navItem.roles);
    }
    return requiredRoles.some((role) => roles.includes(role));
  }
  return true;
};

/**
 * Displays a single navigation item and decides whether it is accessible for the current user.
 *
 * @remarks
 * This component renders the leaf node for a navigation menu entry and checks the item roles
 * against the current user roles before enabling its actions.
 */
@Component({
  selector: 'nas-navbar-item',
  imports: [IconComponent, MatRippleModule, RouterModule, TypeofPipe],
  templateUrl: './navbar-item.component.html',
})
export class NavigationItemComponent {
  /** The navigation item definition to render. */
  @Input() item!: NavItem;
  /** Roles available to the current user. */
  @Input() roles!: string[];

  /**
   * Checks whether the provided navigation item is allowed for the current user.
   *
   * @param navItem The item whose role requirements should be validated.
   * @returns True when the item is visible to the current user, otherwise false.
   */
  isAllowed(navItem: NavItem): boolean {
    return checkRoles(this.roles, navItem);
  }
}

/**
 * Renders a collapsible navigation section and delegates interaction to the parent navigation tree.
 *
 * @remarks
 * This component supports nested menu entries and ensures that child nodes respect the role
 * checks and visibility rules defined by its parent navigation component.
 */
@Component({
  selector: 'nas-navbar-collapsible',
  imports: [IconComponent, MatRippleModule, NavigationItemComponent, NgClass, RouterModule, TypeofPipe],
  templateUrl: './navbar-collapsible.component.html',
  animations: [trigger('children', [state('hidden', style({ height: 0 })), transition('* => *', [animate('0.2s')])])],
})
export class NavigationCollapsibleComponent {
  /** The collapsible navigation item definition. */
  @Input() item!: NavItem;
  /** Parent navigation component used for shared click and visibility behavior. */
  @Input() navigation!: NavigationComponent;
  /** Roles available to the current user. */
  @Input() roles!: string[];

  /**
   * Delegates a click event to the parent navigation controller.
   *
   * @param event The DOM event emitted by the clicked item.
   * @param navItem The clicked navigation item.
   */
  handleClick(event: any, navItem: NavItem): void {
    this.navigation.handleClick(event, navItem);
  }

  /**
   * Checks whether the provided navigation item is allowed for the current user.
   *
   * @param navItem The item whose role requirements should be validated.
   * @returns True when the item is allowed, otherwise false.
   */
  isAllowed(navItem: NavItem): boolean {
    return checkRoles(this.roles, navItem);
  }

  /**
   * Determines whether the provided item is visible to the current user.
   *
   * @param navItem The item to evaluate.
   * @returns True when the item should be displayed, otherwise false.
   */
  visible(navItem: NavItem): boolean {
    return this.navigation.visible(navItem);
  }
}

/**
 * Root navigation component that renders and manages the application menu tree.
 *
 * @remarks
 * This component is responsible for building the top-level menu structure, handling expansion/collapse
 * interaction, and filtering items based on the authenticated user's roles and visibility rules.
 */
@Component({
  selector: 'nas-navbar-navigation',
  imports: [MatRippleModule, NavigationCollapsibleComponent, NavigationItemComponent, NgClass, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavigationComponent {
  /** The list of navigation items displayed in the menu. */
  @Input() items!: NavItem[];

  userRoles: string[];

  constructor(@Optional() auth?: AuthService) {
    this.userRoles = auth?.getUserRoles() || [];
  }

  handleClick(event: any, navItem: NavItem) {
    for (const item of this.items) {
      if (item !== navItem && item.expanded) {
        if (!this.containsItem(item, navItem)) {
          item.expanded = false;
          this.collapseChildren(item);
        }
      }
    }

    if (navItem.disabled) {
      event.preventDefault();
      return;
    }

    navItem.expanded = !navItem.expanded;

    if (!navItem.url) {
      event.preventDefault();
    }

    if (navItem.command) {
      navItem.command(event, navItem);
    }
  }

  isAllowed(navItem: NavItem): boolean {
    return checkRoles(this.userRoles, navItem);
  }

  visible(navItem: NavItem): boolean {
    if (navItem.hidden !== undefined && navItem.hidden !== null) {
      if (typeof navItem.hidden === 'boolean') {
        return !navItem.hidden;
      }
      return !navItem.hidden(navItem);
    }
    return true;
  }

  private collapseChildren(navItem: NavItem): void {
    if (!navItem.children) {
      return;
    }

    for (const child of navItem.children) {
      if (child.children) {
        child.expanded = false;
        this.collapseChildren(child);
      }
    }
  }

  private containsItem(navItem: NavItem, targetItem: NavItem): boolean {
    if (!navItem.children) {
      return false;
    }

    for (const child of navItem.children) {
      if (child === targetItem) {
        return true;
      }
      if (child.children) {
        return this.containsItem(child, targetItem);
      }
    }
    return false;
  }
}
