import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../types';

export class FilesService {
  constructor(private config: ApiConfig, private http: HttpClient) {}

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.config.baseUrl}/files/v1`, formData, { reportProgress: true });
  }
}
