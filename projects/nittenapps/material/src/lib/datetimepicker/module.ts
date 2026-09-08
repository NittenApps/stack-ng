import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { MatMomentDatetimeModule } from '@mat-datetimepicker/moment';
import { StackFormsModule } from '@nittenapps/forms';
import { StackMatFormFieldModule } from '../form-field';
import { StackFieldDatetimepicker } from './datetimepicker.type';

@NgModule({
  declarations: [StackFieldDatetimepicker],
  imports: [
    MatDatepickerModule,
    MatDatetimepickerModule,
    MatInputModule,
    MatMomentDatetimeModule,
    ReactiveFormsModule,
    StackMatFormFieldModule,
    StackFormsModule.forChild({
      types: [{ name: 'datetimepicker', component: StackFieldDatetimepicker, wrappers: ['form-field'] }],
    }),
  ],
})
export class StackMatDatetimepickerModule {}
