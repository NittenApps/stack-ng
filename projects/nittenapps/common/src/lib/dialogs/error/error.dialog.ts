import { Component, Inject, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FaDuotoneIconComponent } from '@fortawesome/angular-fontawesome';
import { faHexagonExclamation } from '@fortawesome/pro-duotone-svg-icons';
import { DialogData } from '../../types';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'nas-error-dialog',
    imports: [DatePipe, FaDuotoneIconComponent, MatButtonModule, MatDialogModule],
    templateUrl: './error.dialog.html'
})
/** Diálogo para mostrar errores de negocio al usuario final. */
export class ErrorDialog {
  faHexagonExclamation = faHexagonExclamation;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
