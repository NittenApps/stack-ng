import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { Catalog } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';

/**
 * Resolves a catalog by route id, or creates a temporary active catalog when
 * creating a new one.
 *
 * @param route The activated route snapshot containing the catalog id.
 * @returns The resolved catalog object, or an observable that completes after
 * redirecting when the catalog does not exist.
 */
export const catalogResolver: ResolveFn<Catalog> = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const id = route.paramMap.get('id')!;
  const activityService = new ActivityService(inject(NAS_API_CONFIG), inject(HttpClient), 'configCatalogs');

  if (id === '__NEW__') {
    return {
      active: true,
    };
  }

  return activityService.getObject(id).pipe(
    map((response) => response.body.object),
    mergeMap((catalog) => {
      if (catalog) {
        return of(catalog);
      }
      router.navigate(['..']);
      return EMPTY;
    }),
  );
};
