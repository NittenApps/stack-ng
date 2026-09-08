import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { Module } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';

/**
 * Resolves a module for the current route.
 *
 * Creates a new active module for the `__NEW__` route identifier. Otherwise,
 * loads the module by its identifier and navigates to the parent route when
 * the module cannot be found.
 *
 * @param route The activated route containing the module identifier.
 * @returns The resolved module or an observable that emits the module.
 */
export const moduleResolver: ResolveFn<Module> = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const id = route.paramMap.get('id')!;
  const activityService = new ActivityService(inject(NAS_API_CONFIG), inject(HttpClient), 'configModules');

  if (id === '__NEW__') {
    return {
      active: true,
    };
  }

  return activityService.getObject(id).pipe(
    map((response) => response.body.object),
    mergeMap((activity) => {
      if (activity) {
        return of(activity);
      }
      router.navigate(['..']);
      return EMPTY;
    }),
  );
};
