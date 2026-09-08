import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Data, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Breadcrumb, BreadcrumbConfig } from '../types/breadcrumb';

/**
 * Builds and exposes breadcrumbs from the router's active route tree.
 *
 * The breadcrumb trail is recalculated after each completed navigation and
 * can be consumed through {@link breadcrumbs$}.
 */
@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  /** Internal stream containing the current breadcrumb trail. */
  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

  /** Observable stream of breadcrumbs for the current route. */
  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  /**
   * Creates the service and subscribes to completed router navigations.
   *
   * @param router Router used to observe navigation events and inspect the active route tree.
   */
  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      const root = this.router.routerState.snapshot.root;
      const breadcrumbs: Breadcrumb[] = [];
      this.addBreadcrumb(root, [], breadcrumbs);
      this._breadcrumbs$.next(breadcrumbs);
    });
  }

  /**
   * Recursively adds breadcrumb entries for the active route and its children.
   *
   * @param route Current route snapshot to inspect.
   * @param parentUrl URL segments collected from parent routes.
   * @param breadcrumbs Mutable list to which breadcrumb entries are added.
   */
  private addBreadcrumb(route: ActivatedRouteSnapshot | null, parentUrl: string[], breadcrumbs: Breadcrumb[]): void {
    if (route) {
      const routeUrl = parentUrl.concat(route.url.map((url) => url.path));

      if (route.data['breadcrumb']) {
        const breadcrumb = {
          disabled: this.getBreadcrumbConfig(route.data['breadcrumb'])?.disabled || false,
          label: this.getLabel(route.data),
          url: '/' + routeUrl.join('/'),
        };
        if (breadcrumbs.length == 0 || breadcrumbs[breadcrumbs.length - 1].label !== breadcrumb.label) {
          breadcrumbs.push(breadcrumb);
        }
      }

      this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
    }
  }

  /**
   * Converts route breadcrumb data into a breadcrumb configuration.
   *
   * @param value Route breadcrumb data.
   * @returns The configuration when the value is a configuration object; otherwise `null`.
   */
  private getBreadcrumbConfig(value: any): BreadcrumbConfig | null {
    if (typeof value === 'object' && 'label' in value) {
      return value as BreadcrumbConfig;
    }
    return null;
  }

  /**
   * Resolves a breadcrumb label from route data or a label callback.
   *
   * @param data Route data containing the breadcrumb definition.
   * @returns The resolved breadcrumb label.
   */
  private getLabel(data: Data): any {
    return typeof data['breadcrumb'] === 'function'
      ? data['breadcrumb'](data)
      : typeof data['breadcrumb'] === 'object'
        ? this.getLabelFromConfig(this.getBreadcrumbConfig(data['breadcrumb']), data)
        : data['breadcrumb'];
  }

  /**
   * Resolves the label from a breadcrumb configuration.
   *
   * @param config Breadcrumb configuration, if available.
   * @param data Route data passed to a dynamic label callback.
   * @returns The resolved label, or an empty string when no configuration exists.
   */
  private getLabelFromConfig(config: BreadcrumbConfig | null, data: Data): any {
    if (!config) {
      return '';
    }
    return typeof config.label === 'function' ? config.label(data) : config.label;
  }
}
