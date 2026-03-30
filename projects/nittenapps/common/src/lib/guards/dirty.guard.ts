import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialog } from '../dialogs';
import { DirtyAware } from '../types';

/** Solicita confirmación antes de salir de una vista con cambios sin guardar. */
export const dirtyGuard: CanDeactivateFn<DirtyAware> = async (component, _route, state, _nextState) => {
  if (!component.isDirty()) {
    return true;
  }

  const location = inject(Location);
  const router = inject(Router);
  const dialogRef = inject(MatDialog).open(ConfirmDialog, {
    width: '640px',
    data: { title: 'Datos sin guardar', message: 'Hay datos sin guardar, si continúas se perderán, ¿estás seguro?' },
  });

  const result = await lastValueFrom(dialogRef.afterClosed());
  if (!result) {
    location.go(state.url);
  }
  return result;
};
