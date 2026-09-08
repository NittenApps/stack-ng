import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { FieldGroup } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';

/**
 * Resolves a field group for the current route.
 *
 * Returns a default active field group for new groups and redirects to the
 * parent route when an existing group cannot be found.
 *
 * @param route The activated route containing the field group identifier.
 * @returns The resolved field group or an empty observable when it is missing.
 */
export const fieldGroupResolver: ResolveFn<FieldGroup> = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const id = route.paramMap.get('id')!;
  const activityService = new ActivityService(inject(NAS_API_CONFIG), inject(HttpClient), 'configFieldGroups');

  if (id === '__NEW__') {
    return {
      active: true,
    };
  }

  return activityService.getObject(id).pipe(
    map((response) => response.body.object),
    mergeMap((fieldGroup) => {
      if (fieldGroup) {
        return of(fieldGroup);
      }
      router.navigate(['..']);
      return EMPTY;
    }),
  );
};
