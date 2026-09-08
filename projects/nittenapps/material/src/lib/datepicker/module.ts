import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@nittenapps/common';
import { StackFormsModule } from '@nittenapps/forms';
import { StackMatFormFieldModule } from '../form-field';
import { StackFieldDatepicker } from './datepicker.type';

@NgModule({
  declarations: [StackFieldDatepicker],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    ReactiveFormsModule,
    StackMatFormFieldModule,
    StackFormsModule.forChild({
      types: [{ name: 'datepicker', component: StackFieldDatepicker, wrappers: ['form-field'] }],
    }),
  ],
})
export class StackMatDatepickerModule {}
