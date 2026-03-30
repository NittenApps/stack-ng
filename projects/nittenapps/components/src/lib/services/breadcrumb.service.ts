import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Data, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Breadcrumb, BreadcrumbConfig } from '../types/breadcrumb';

/** Servicio que construye el breadcrumb actual a partir de las rutas activas. */
@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      const root = this.router.routerState.snapshot.root;
      const breadcrumbs: Breadcrumb[] = [];
      this.addBreadcrumb(root, [], breadcrumbs);
      this._breadcrumbs$.next(breadcrumbs);
    });
  }

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

  private getBreadcrumbConfig(value: any): BreadcrumbConfig | null {
    if (typeof value === 'object' && 'label' in value) {
      return value as BreadcrumbConfig;
    }
    return null;
  }

  private getLabel(data: Data): any {
    return typeof data['breadcrumb'] === 'function'
      ? data['breadcrumb'](data)
      : typeof data['breadcrumb'] === 'object'
      ? this.getLabelFromConfig(this.getBreadcrumbConfig(data['breadcrumb']), data)
      : data['breadcrumb'];
  }

  private getLabelFromConfig(config: BreadcrumbConfig | null, data: Data): any {
    if (!config) {
      return '';
    }
    return typeof config.label === 'function' ? config.label(data) : config.label;
  }
}
