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
import { StackMatSelectModule } from './select';
import { StackMatTableModule } from './table';
import { StackMatTabsModule } from './tabs';
import { StackMatToggleModule } from './slide-toogle';

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
    StackMatSelectModule,
    StackMatTableModule,
    StackMatTabsModule,
    StackMatToggleModule,
  ],
})
export class StackMaterialModule {}
