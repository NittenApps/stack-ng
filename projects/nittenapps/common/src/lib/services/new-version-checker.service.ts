import { Injectable, NgZone } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';

/** Service that periodically checks whether a new published version of the application exists. */
@Injectable({ providedIn: 'root' })
export class NewVersionCheckerService {
  intervalSource = interval(30 * 60000);
  intervalSubscription?: Subscription;

  private isNewVersionAvailable$ = new BehaviorSubject<boolean>(false);

  /** Emits `true` when the service worker detects an available update. */
  get newVersionAvailable(): Observable<boolean> {
    return this.isNewVersionAvailable$;
  }

  constructor(private swUpdate: SwUpdate, private zone: NgZone) {
    this.checkForUpdate();
  }

  /** Activates the downloaded new version and reloads the application. */
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
