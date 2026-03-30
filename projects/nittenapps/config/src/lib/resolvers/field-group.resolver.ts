import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { ActivityService, NAS_API_CONFIG } from '@nittenapps/api';
import { FieldGroup } from '@nittenapps/common';
import { EMPTY, map, mergeMap, of } from 'rxjs';
/** Obtiene los datos de un grupo de campos aplicando la msima logica si existe un id extrae la informacion caso contrario no*/
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
