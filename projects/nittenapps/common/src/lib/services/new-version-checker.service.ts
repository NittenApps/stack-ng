import { Injectable, NgZone } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';

/**
 * Checks for a newer application version published by the Angular service worker
 * and exposes whether an update is available.
 *
 * The service periodically polls the service worker for an update, stores the
 * result in a BehaviorSubject, and allows consumers to trigger a reload after
 * the update has been activated.
 */
@Injectable({ providedIn: 'root' })
export class NewVersionCheckerService {
  intervalSource = interval(30 * 60000);
  intervalSubscription?: Subscription;

  private isNewVersionAvailable$ = new BehaviorSubject<boolean>(false);

  get newVersionAvailable(): Observable<boolean> {
    return this.isNewVersionAvailable$;
  }

  constructor(
    private swUpdate: SwUpdate,
    private zone: NgZone,
  ) {
    this.checkForUpdate();
  }

  applyUpdate(): void {
    this.swUpdate
      .activateUpdate()
      .then(() => document.location.reload())
      .catch((error) => console.error('Failed to apply updates', error));
  }

  private checkForUpdate(): void {
    this.intervalSubscription?.unsubscribe();
    if (!this.swUpdate.isEnabled) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.intervalSubscription = this.intervalSource.subscribe(async () => {
        try {
          const isNewVersionAvailable = await this.swUpdate.checkForUpdate();
          this.isNewVersionAvailable$.next(isNewVersionAvailable);
        } catch (error) {
          console.error('Failed to check for updates', error);
        }
      });
    });
  }
}
