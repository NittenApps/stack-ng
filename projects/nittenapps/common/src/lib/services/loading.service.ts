import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 *  Servicio global de loading para habilitar o desabilitar
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable();

  loadingOn(): void {
    this.loadingSubject.next(true);
  }

  loadingOff(): void {
    this.loadingSubject.next(false);
  }
}
