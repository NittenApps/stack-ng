import { Component, Inject, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FaDuotoneIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleQuestion } from '@fortawesome/pro-duotone-svg-icons';
import { DialogData } from '../../types';

/**
 * Confirmation dialog component used to present a confirmation prompt with a title,
 * message, and optional action buttons.
 *
 * This component is intended to be opened as an Angular Material dialog and may
 * receive `DialogData` through the injected `MAT_DIALOG_DATA` token.
 */
@Component({
  selector: 'nas-confirm-dialog',
  imports: [FaDuotoneIconComponent, MatButtonModule, MatDialogModule],
  templateUrl: './confirm.dialog.html',
})
export class ConfirmDialog {
  /**
   * Icon used in the confirmation dialog.
   */
  faCircleQuestion = faCircleQuestion;

  /**
   * Creates a confirmation dialog instance.
   *
   * @param data Optional dialog payload injected via `MAT_DIALOG_DATA`.
   */
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
