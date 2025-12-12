import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FieldWrapper } from '../../src/lib/directives';
import { StackFormsModule } from '../../src/lib/forms.module';

@Component({
    selector: 'nas-type-input',
    template: `<input type="text" [formControl]="formControl" [nasFormsAttributes]="field" />`,
    standalone: false
})
export class StackFieldInput extends FieldType<FieldTypeConfig> {}

@Component({
    selector: 'nas-wrapper-form-field',
    template: `
    <label [attr.for]="id">{{ props.label }}</label>
    <ng-template #fieldComponent></ng-template>
    <ng-container *ngIf="showError">
      <nas-validation-message [field]="field" />
    </ng-container>
  `,
    standalone: false
})
export class StackWrapperFormField extends FieldWrapper {}

@NgModule({
  declarations: [StackFieldInput, StackWrapperFormField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StackFormsModule.forChild({
      types: [{ name: 'input', component: StackFieldInput, wrappers: ['form-field'] }],
      wrappers: [{ name: 'form-field', component: StackWrapperFormField }],
    }),
  ],
})
export class StackInputModule {}
