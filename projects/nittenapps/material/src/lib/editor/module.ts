import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StackFormsModule } from '@nittenapps/forms';
import { QuillModule } from 'ngx-quill';
import { StackMatEditor } from './editor.type';

@NgModule({
  declarations: [StackMatEditor],
  imports: [
    QuillModule,
    ReactiveFormsModule,
    StackFormsModule.forChild({ types: [{ name: 'editor', component: StackMatEditor }] }),
  ],
})
export class StackMatEditorModule {}
