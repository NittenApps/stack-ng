import { DatePipe } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FaDuotoneIconComponent } from '@fortawesome/angular-fontawesome';
import { faHexagonExclamation } from '@fortawesome/pro-duotone-svg-icons';
import { DialogData } from '../../types';

/**
 * Displays error details in a modal dialog.
 */
@Component({
  selector: 'nas-error-dialog',
  imports: [DatePipe, FaDuotoneIconComponent, MatButtonModule, MatDialogModule],
  templateUrl: './error.dialog.html',
})
export class ErrorDialog {
  faHexagonExclamation = faHexagonExclamation;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
