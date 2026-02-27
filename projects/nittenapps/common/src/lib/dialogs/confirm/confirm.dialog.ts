import { Component, Inject, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FaDuotoneIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleQuestion } from '@fortawesome/pro-duotone-svg-icons';
import { DialogData } from '../../types';

@Component({
    selector: 'nas-confirm-dialog',
    imports: [FaDuotoneIconComponent, MatButtonModule, MatDialogModule],
    templateUrl: './confirm.dialog.html'
})
export class ConfirmDialog {
  faCircleQuestion = faCircleQuestion;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
