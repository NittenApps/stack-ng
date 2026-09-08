import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialog } from '../dialogs';
import { DirtyAware } from '../types';

/**
 * Prevents navigation away from the current route when the component has unsaved data.
 *
 * If the component is considered dirty, a confirmation dialog is displayed. When the user
 * cancels the action, the previous URL is restored; otherwise the navigation continues.
 *
 * @param component The component instance implementing the DirtyAware contract.
 * @param _route The route being deactivated.
 * @param state The current router state before navigation.
 * @param _nextState The target router state after navigation.
 * @returns A promise resolving to true when navigation is allowed, or false when it is cancelled.
 */
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
