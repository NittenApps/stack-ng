import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { Activity } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';
/** Resolves the initial route data for an activity through the activity sent in the route.
 * If the id is __NEW__, it marks the activity as new and shows nothing; if it is a valid id,
 * it gets the corresponding object.
 * */
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
    })
  );
};
