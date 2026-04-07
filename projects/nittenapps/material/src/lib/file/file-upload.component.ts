import { AsyncPipe } from '@angular/common';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FilesService, NAS_API_CONFIG } from '@nittenapps/api';
import { forkJoin, Subject } from 'rxjs';

type ProgressType = {
  progress: Subject<number>;
  error?: string;
};

@Component({
  selector: 'nas-file-upload',
  imports: [AsyncPipe, MatButtonModule, MatDialogModule, MatIconModule, MatListModule, MatProgressBarModule],
  templateUrl: './file-upload.component.html',
})
/**
 * Modal responsible for selecting files, uploading them to the API, and returning the uploaded attachments.
 * It is used as support for the `file` field to centralize the upload flow.
 */
export class FileUploadComponent {
  @ViewChild('file') file: any;

  canBeClosed = true;
  files: Set<File> = new Set();
  multiple: boolean;
  primaryButtonText = 'Cargar';
  progress?: { [key: string]: ProgressType };
  showCancelButton = true;
  uploadSuccessful = false;
  uploading = false;
  validMIMETypes: string;

  private readonly filesService;
  private uploadedFiles: {
    valueCode: string;
    valueString: string;
    valueText: string;
  }[] = [];

  constructor(private dialogRef: MatDialogRef<FileUploadComponent>) {
    const apiConfig = inject(NAS_API_CONFIG);
    const data = inject(MAT_DIALOG_DATA);
    const http = inject(HttpClient);

    this.filesService = new FilesService(apiConfig, http);

    this.multiple = !!data?.multiple;
    this.validMIMETypes = '';
    data?.types?.forEach((type: string) => {
      if (type === 'PN') {
        this.validMIMETypes += 'image/png,';
      } else if (type === 'IM') {
        this.validMIMETypes += 'image/*,';
      } else if (type === 'PD') {
        this.validMIMETypes += 'application/pdf,';
      } else if (type === 'XM') {
        this.validMIMETypes += 'text/xml,';
      } else if (type === 'VD') {
        this.validMIMETypes += 'video/*,';
      } else if (type === 'WR') {
        this.validMIMETypes +=
          'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,';
      } else if (type === 'EX') {
        this.validMIMETypes +=
          'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,';
      }
    });
    if (this.validMIMETypes.endsWith(',')) {
      this.validMIMETypes = this.validMIMETypes.slice(0, -1);
    }
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  closeDialog(): void {
    if (this.uploadSuccessful) {
      return this.dialogRef.close(this.uploadedFiles);
    }

    this.primaryButtonText = 'Terminar';
    this.canBeClosed = false;
    this.dialogRef.disableClose = true;
    this.showCancelButton = true;
    this.uploading = true;

    this.progress = this.createProgress(this.files);
    const allProgressObservables = [];
    for (const key in this.progress) {
      allProgressObservables.push(this.progress[key].progress.asObservable());
    }

    forkJoin(allProgressObservables).subscribe({
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.canBeClosed = true;
        this.dialogRef.disableClose = false;
        this.uploadSuccessful = true;
        this.uploading = false;
      },
    });

    this.uploadFiles(this.files);
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        this.files.add(files[key]);
      }
    }
  }

  removeFile(file: File): void {
    this.files.delete(file);
    delete this.progress?.[file.name];
  }

  private createProgress(files: Set<File>): { [key: string]: ProgressType } {
    const progress: { [key: string]: ProgressType } = {};
    files.forEach((file) => {
      progress[file.name] = {
        progress: new Subject<number>(),
      };
    });

    return progress;
  }

  private uploadFiles(files: Set<File>): void {
    files.forEach((file) => {
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);
      formData.append('filename', file.name);
      this.filesService.uploadFile(formData).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const percentDone = Math.round((100 * event.loaded) / event.total);
            this.progress?.[file.name].progress.next(percentDone);
          } else if (event instanceof HttpResponse || event.success) {
            this.progress?.[file.name].progress.next(100);
            this.progress?.[file.name].progress.complete();
            delete event.result;
            this.uploadedFiles.push(event.body.object);
          }
        },
        error: (err) => {
          (<any>this.progress!)[file.name].error = err.error?.message || 'Error subiendo archivo';
        },
      });
    });
  }
}
