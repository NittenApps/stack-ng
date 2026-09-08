import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StackFormsModule } from '@nittenapps/forms';
import { StackFormsWrapperFormField } from './form-field.wrapper';

@NgModule({
  declarations: [StackFormsWrapperFormField],
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    StackFormsModule.forChild({ wrappers: [{ name: 'form-field', component: StackFormsWrapperFormField }] }),
  ],
})
export class StackMatFormFieldModule {}
