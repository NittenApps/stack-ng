import { NgModule } from '@angular/core';
import { StackMatAddonsModule } from './addons';
import { StackMatAutocompleteModule } from './autocomplete';
import { StackMatButtonModule } from './button';
import { StackMatDatepickerModule } from './datepicker';
import { StackMatDatetimepickerModule } from './datetimepicker';
import { StackMatEditorModule } from './editor';
import { StackMatFileModule } from './file';
import { StackMatFormFieldModule } from './form-field';
import { StackMatInputModule } from './input';
import { StackMatLogbookModule } from './logbook';
import { StackMatMultiSelectModule } from './multi-select';
import { StackMatSelectModule } from './select';
import { StackMatToggleModule } from './slide-toogle';
import { StackMatTableModule } from './table';
import { StackMatTabsModule } from './tabs';

@NgModule({
  imports: [
    StackMatAddonsModule,
    StackMatAutocompleteModule,
    StackMatButtonModule,
    StackMatDatepickerModule,
    StackMatDatetimepickerModule,
    StackMatEditorModule,
    StackMatFileModule,
    StackMatFormFieldModule,
    StackMatInputModule,
    StackMatLogbookModule,
    StackMatMultiSelectModule,
    StackMatSelectModule,
    StackMatTableModule,
    StackMatTabsModule,
    StackMatToggleModule,
  ],
})
export class StackMaterialModule {}
