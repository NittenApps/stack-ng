import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { StackFormsModule } from '@nittenapps/forms';
import { StackFormsSelectModule } from '@nittenapps/forms/select';
import { StackMatFormFieldModule } from '../form-field';
import { StackFieldAutocomplete } from './autocomplete.type';

@NgModule({
  declarations: [StackFieldAutocomplete],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    StackFormsSelectModule,
    StackMatFormFieldModule,
    StackFormsModule.forChild({
      types: [{ name: 'autocomplete', component: StackFieldAutocomplete, wrappers: ['form-field'] }],
    }),
  ],
})
export class StackMatAutocompleteModule {}
