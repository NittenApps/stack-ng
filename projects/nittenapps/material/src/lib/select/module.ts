import { NgModule } from '@angular/core';
import { StackFieldMatSelect } from './select.type';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPseudoCheckboxModule } from '@angular/material/core';
import { CommonModule as NASCommonModule } from '@nittenapps/common';
import { StackFormsModule } from '@nittenapps/forms';
import { StackFormsSelectModule } from '@nittenapps/forms/select';
import { StackMatFormFieldModule } from '../form-field';

@NgModule({
  declarations: [StackFieldMatSelect],
  imports: [
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatPseudoCheckboxModule,
    NASCommonModule,
    ReactiveFormsModule,
    StackFormsSelectModule,
    StackMatFormFieldModule,
    StackFormsModule.forChild({
      types: [
        { name: 'select', component: StackFieldMatSelect, wrappers: ['form-field'] },
        { name: 'enum', extends: 'select' },
      ],
    }),
  ],
})
export class StackMatSelectModule {}
