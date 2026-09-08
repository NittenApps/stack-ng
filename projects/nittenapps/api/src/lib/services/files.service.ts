import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../types';

/**
 * Provides file-related operations through the API.
 */
export class FilesService {
  constructor(
    private config: ApiConfig,
    private http: HttpClient,
  ) {}

  /**
   * Uploads a file to the API.
   *
   * @param formData Form data containing the file to upload.
   * @returns An observable for the upload response and progress events.
   */
  uploadFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.config.baseUrl}/files/v1`, formData, { reportProgress: true });
  }
}
