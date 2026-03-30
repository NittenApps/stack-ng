import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { Catalog } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';
/** Obtiene los datos de un catologo siempre y cuando se tenga un id valido en dado caso que no continua con la renderizacion normal */
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
    })
  );
};
