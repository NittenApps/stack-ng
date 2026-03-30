import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { Activity } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';
/** Resuelve los datos iniciales de la ruta para una actividad mediante el activity enviado en la ruta.
 * Si el id es __NEW__, marca la actividad como nueva y no muestra nada en caso de que sea un id valido,
 * obtiene el objeto correspondiente.
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
