import { NgModule } from '@angular/core';
import { StackFieldMatMultiSelect } from './multi-select.type';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { CommonModule as NASCommonModule } from '@nittenapps/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { StackFormsModule } from '@nittenapps/forms';
import { StackMatFormFieldModule } from '../form-field';

@NgModule({
  declarations: [StackFieldMatMultiSelect],
  imports: [
    CommonModule,
    FaIconComponent,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    NASCommonModule,
    ReactiveFormsModule,
    StackMatFormFieldModule,
    StackFormsModule.forChild({
      types: [{ name: 'multi-select', component: StackFieldMatMultiSelect, wrappers: ['form-field'] }],
    }),
  ],
})
export class StackMatMultiSelectModule {}
