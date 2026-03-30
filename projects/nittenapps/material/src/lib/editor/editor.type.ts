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
 * Tipo de campo que integra un editor enriquecido basado en Quill.
 * Se usa para capturar contenido con formato dentro de formularios Material.
 */
export class StackMatEditor extends FieldType<FieldTypeConfig<EditorProps>> {}
