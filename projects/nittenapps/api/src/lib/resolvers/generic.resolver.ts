import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { snakeToCamel } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';
import { ActivityService, NAS_API_CONFIG } from '../services';

/**
 * Resuelve los datos iniciales de la ruta.
 * Si el id es __NEW__, marca el registro como nuevo;
 * en caso de que sea un id valido, obtiene el objeto correspondiente.
 */
export const genericResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const id = route.paramMap.get('id')!;
  const activity = snakeToCamel(route.parent!.url[0].path?.replaceAll('-', '_'));
  const activityService = new ActivityService(inject(NAS_API_CONFIG), inject(HttpClient), activity);

  if (!activity) {
    return EMPTY;
  }

  if (id === '__NEW__') {
    return { isNew: true };
  }

  return activityService.getObject(id).pipe(
    map((response) => response.body.object),
    mergeMap((object) => {
      if (object) {
        return of(object);
      }
      router.navigate(['..']);
      return EMPTY;
    })
  );
};
