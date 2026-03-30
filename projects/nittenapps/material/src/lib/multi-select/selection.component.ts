import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StackFormsSelectModule } from '@nittenapps/forms/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'nas-selection',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    StackFormsSelectModule,
  ],
  templateUrl: './selection.component.html',
})
/**
 * Modal que muestra opciones seleccionables con checkboxes para el campo multi-select.
 * Se usa para confirmar la selección final antes de devolverla al control principal.
 */
export class SelectionComponent {
  form: FormGroup;
  options: { id: string; code: string; name: string }[] = [];

  constructor(
    private dialogRef: MatDialogRef<SelectionComponent>,
    fb: FormBuilder,
  ) {
    this.form = fb.group({
      values: fb.array([]),
    });

    const data = inject(MAT_DIALOG_DATA);
    this.options = data.options || [];

    const values: any[] = data.value || [];
    this.options.forEach((option) => {
      const control = fb.control(!!values.find((v) => data.compareWith(option, v)));
      (this.form.controls['values'] as FormArray).push(control);
    });
  }

  closeDialog() {
    const selectedValues = this.form.value.values
      .map((checked: boolean, index: number) => (checked ? this.options[index] : null))
      .filter((v: any) => v !== null);
    this.dialogRef.close(selectedValues);
  }
}
