import { Component, Type, ViewChild } from '@angular/core';
import { FieldType, StackFieldProps } from '../form-field';
import { FieldTypeConfig, StackFieldConfig } from '@nittenapps/forms';
import { QuillEditorComponent } from 'ngx-quill';

interface EditorProps extends StackFieldProps {}

export interface StackEditorConfig extends StackFieldConfig<EditorProps> {
  type: 'editor' | Type<StackMatEditor>;
}

@Component({
  selector: 'nas-field-mat-editor',
  templateUrl: './editor.type.html',
  styleUrl: './editor.type.scss',
  standalone: false,
})
/**
 * Field type that integrates a rich text editor based on Quill.
 * It is used to capture formatted content within Material forms.
 */
export class StackMatEditor extends FieldType<FieldTypeConfig<EditorProps>> {}
