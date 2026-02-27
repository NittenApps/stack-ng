import { Component, inject, Type } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { faFile, faFileExcel, faFilePdf, IconDefinition } from '@fortawesome/pro-duotone-svg-icons';
import { faPencil, faPlus } from '@fortawesome/pro-solid-svg-icons';
import { ApiConfig, NAS_API_CONFIG } from '@nittenapps/api';
import { FieldArrayType, FieldArrayTypeConfig, StackFieldConfig, StackFieldProps } from '@nittenapps/forms';
import { FileUploadComponent } from './file-upload.component';

interface FileProps extends StackFieldProps {
  multiple?: boolean;
  accept?: string;
}

export interface StackFileConfig extends StackFieldConfig<FileProps> {
  type: 'file' | Type<StackMatFile>;
}

@Component({
  selector: 'nas-field-mat-file',
  templateUrl: './file.type.html',
  styleUrl: './file.type.scss',
  standalone: false,
})
export class StackMatFile extends FieldArrayType<FieldArrayTypeConfig<FileProps>> {
  readonly faPencil = faPencil;
  readonly faPlus = faPlus;
  readonly faFile = faFile;

  readonly icons: { [key: string]: IconDefinition } = {
    pdf: faFilePdf,
    xls: faFileExcel,
    xlsx: faFileExcel,
  };

  get accept(): string {
    return this.props.accept || '';
  }

  get multiple(): boolean {
    return !!this.props.multiple;
  }

  get title(): string {
    return this.multiple ? 'Agregar archivos' : 'Seleccionar archivo';
  }

  readonly apiConfig: ApiConfig;

  constructor(private dialog: MatDialog) {
    super();

    this.apiConfig = inject(NAS_API_CONFIG);
  }

  selectFile(): void {
    this.dialog
      .open(FileUploadComponent, {
        data: { multiple: this.multiple, types: this.accept.split(',') },
        width: '80%',
        height: '80%',
      })
      .afterClosed()
      .subscribe((files) => {
        if (files && files.length > 0) {
          const fileArray = this.form?.get(String(this.key!)) as FormArray;
          if (!this.multiple) {
            fileArray.clear();
          }
          files.forEach((file: any) => {
            super.add(undefined, file);
          });
        }
      });
  }
}
