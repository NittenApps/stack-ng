import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 *  Global loading service to enable or disable the loading state
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
