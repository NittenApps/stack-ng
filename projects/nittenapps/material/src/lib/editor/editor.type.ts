import { Component, Type } from '@angular/core';
import { FieldTypeConfig, StackFieldConfig } from '@nittenapps/forms';
import { FieldType, StackFieldProps } from '../form-field';

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
export class StackMatEditor extends FieldType<FieldTypeConfig<EditorProps>> {}
