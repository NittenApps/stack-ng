import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { Activity } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';

/**
 * Resolves an activity for the route.
 *
 * Returns a new active activity when the route ID is `__NEW__`. Otherwise,
 * loads the activity by ID and navigates to the parent route when it cannot
 * be found.
 *
 * @param route The route snapshot containing the activity ID.
 * @returns The resolved activity, or an empty observable when no activity exists.
 */
export const activityResolver: ResolveFn<Activity> = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const id = route.paramMap.get('id')!;
  const activityService = new ActivityService(inject(NAS_API_CONFIG), inject(HttpClient), 'configActivities');

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
