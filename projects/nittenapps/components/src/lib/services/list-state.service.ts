import { inject, Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Caches list state while navigating between a list route and its detail
 * routes, and clears the cache when navigating to an unrelated route.
 */
@Injectable({ providedIn: 'root' })
export class ListStateService {
  private readonly router = inject(Router);

  private cache: { baseUrl: string; state: any } | null = null;

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      if (this.cache) {
        const targetUrl = event.url.split('?')[0];
        const isSameList = targetUrl === this.cache.baseUrl;
        const isDetailRoute = targetUrl.startsWith(this.cache.baseUrl + '/');

        if (!isSameList && !isDetailRoute) {
          this.cache = null;
        }
      }
    });
  }

  /**
   * Stores the state for a list route.
   *
   * @param baseUrl The base URL identifying the list route.
   * @param state The state to cache.
   */
  setCache(baseUrl: string, state: any): void {
    this.cache = { baseUrl, state };
  }

  /**
   * Retrieves the cached state for a list route.
   *
   * @param baseUrl The base URL identifying the list route.
   * @returns The cached state, or `null` when no matching state exists.
   */
  getCache(baseUrl: string): any | null {
    if (this.cache && this.cache.baseUrl === baseUrl) {
      return this.cache.state;
    }
    return null;
  }
}
