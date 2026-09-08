import { Injectable, signal } from '@angular/core';

/**
 * Tracks the number of active requests and exposes the application's loading state.
*/
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = signal<number>(0);

  /** Indicates whether one or more requests are currently active. */
  readonly isLoading = () => this.activeRequests() > 0;

  /** Marks a request as active. */
  show(): void {
    this.activeRequests.update((count) => count + 1);
  }

  /** Marks a request as completed without allowing the count to become negative. */
  hide(): void {
    this.activeRequests.update((count) => Math.max(count - 1, 0));
  }
}
