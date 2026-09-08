import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { Field } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';

/**
 * Resolves a field from the route parameter or creates a new active field.
 *
 * Navigates to the parent route when an existing field cannot be found.
 *
 * @param route The activated route containing the field identifier.
 * @returns The resolved field or an observable containing the existing field.
 */
export const fieldResolver: ResolveFn<Field> = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const id = route.paramMap.get('id')!;
  const activityService = new ActivityService(inject(NAS_API_CONFIG), inject(HttpClient), 'configFields');

  if (id === '__NEW__') {
    return {
      active: true,
    };
  }

  return activityService.getObject(id).pipe(
    map((response) => response.body.object),
    mergeMap((field) => {
      if (field) {
        return of(field);
      }
      router.navigate(['..']);
      return EMPTY;
    }),
  );
};
