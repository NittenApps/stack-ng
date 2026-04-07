import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { FieldGroup } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';
/** Gets the data of a field group by applying the same logic: if an id exists, it extracts the information; otherwise, it does not. */
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
    })
  );
};
